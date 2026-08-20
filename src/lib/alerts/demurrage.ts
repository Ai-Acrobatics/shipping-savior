/**
 * Demurrage / detention risk meter (AI-12011).
 *
 * Per-container free-time countdown from the arrival event, with alerts
 * raised BEFORE charges start accruing rather than after.
 *
 * The distinction this module exists to keep straight:
 *
 *   discharge ──[demurrage free time]──▶ gate-out ──[detention free time]──▶ empty return
 *      │            (box in the terminal)    │          (box on the street)      │
 *      └── DEMURRAGE accrues past free ──────┘── DETENTION accrues past free ────┘
 *
 * Demurrage is the terminal charging for storage inside the gate. Detention
 * (per diem) is the carrier charging for their box being off-dock. They are
 * separate clocks with separate free time and separate tariffs, and they hand
 * off at gate-out. Modelling this as a single countdown from arrival is the
 * common mistake: a container picked up on day 3 looks permanently "safe"
 * while it quietly runs up detention for three weeks.
 *
 * Tariff figures below are market-typical DEFAULTS for US import moves, not
 * anyone's contract. Every tariff carries `source: 'default-estimate'` so the
 * UI can say so; override per shipment via `importMeta.demurrageTariff`.
 */

// ─── Types ────────────────────────────────────────────────────

/** Which clock, if any, is currently running against the container. */
export type DemurrageClock = 'pending' | 'demurrage' | 'detention' | 'clear';

export type RiskLevel = 'clear' | 'safe' | 'warning' | 'critical' | 'accruing';

/** How free days are counted. Most ocean carriers use calendar days. */
export type DayBasis = 'calendar' | 'working';

export interface TariffTier {
  /** First chargeable day this tier covers (1-indexed, past free time). */
  fromDay: number;
  /** Last day covered, or null for "and beyond". */
  toDay: number | null;
  perDiemUsd: number;
}

export interface DemurrageTariff {
  carrier: string;
  demurrageFreeDays: number;
  detentionFreeDays: number;
  dayBasis: DayBasis;
  demurrageTiers: TariffTier[];
  detentionTiers: TariffTier[];
  /** `default-estimate` means "market typical", not the customer's contract. */
  source: 'default-estimate' | 'contract';
}

export interface ContainerMilestones {
  /** Discharged / available for pickup. The arrival event the clock runs from. */
  dischargedAt: Date | null;
  /** Gate-out: demurrage stops, detention starts. */
  gateOutAt: Date | null;
  /** Empty returned: detention stops. */
  emptyReturnedAt: Date | null;
  /**
   * True when `dischargedAt` was inferred from ETA rather than an actual
   * discharge event — the countdown is then an estimate, and the UI says so.
   */
  dischargeIsEstimated: boolean;
}

export interface DemurrageRisk {
  clock: DemurrageClock;
  riskLevel: RiskLevel;
  /** Moment free time runs out for the running clock. */
  freeTimeExpiresAt: Date | null;
  /** Whole days until free time expires. Negative once charges accrue. */
  daysRemaining: number | null;
  /** Days already past free time on the running clock. */
  chargeableDays: number;
  /** Charges accrued so far, per container, times the container count. */
  accruedUsd: number;
  /** What it becomes if nothing moves for another 7 days. */
  projectedUsd7d: number;
  /** Today's rate per container per day, 0 while still inside free time. */
  perDiemUsd: number;
  containerCount: number;
  tariff: DemurrageTariff;
  estimated: boolean;
  headline: string;
  detail: string;
}

// ─── Tariffs ──────────────────────────────────────────────────

const STANDARD_DEMURRAGE_TIERS: TariffTier[] = [
  { fromDay: 1, toDay: 5, perDiemUsd: 175 },
  { fromDay: 6, toDay: 10, perDiemUsd: 275 },
  { fromDay: 11, toDay: null, perDiemUsd: 400 },
];

const STANDARD_DETENTION_TIERS: TariffTier[] = [
  { fromDay: 1, toDay: 5, perDiemUsd: 150 },
  { fromDay: 6, toDay: 10, perDiemUsd: 250 },
  { fromDay: 11, toDay: null, perDiemUsd: 350 },
];

export const DEFAULT_TARIFF: DemurrageTariff = {
  carrier: 'Default',
  demurrageFreeDays: 4,
  detentionFreeDays: 5,
  dayBasis: 'calendar',
  demurrageTiers: STANDARD_DEMURRAGE_TIERS,
  detentionTiers: STANDARD_DETENTION_TIERS,
  source: 'default-estimate',
};

function tariff(
  carrier: string,
  demurrageFreeDays: number,
  detentionFreeDays: number,
  overrides: Partial<DemurrageTariff> = {}
): DemurrageTariff {
  return { ...DEFAULT_TARIFF, carrier, demurrageFreeDays, detentionFreeDays, ...overrides };
}

/** Market-typical US import free time by carrier. Keyed lowercase. */
export const CARRIER_TARIFFS: Record<string, DemurrageTariff> = {
  maersk: tariff('Maersk', 4, 5),
  msc: tariff('MSC', 5, 5),
  'cma cgm': tariff('CMA CGM', 4, 4),
  'hapag-lloyd': tariff('Hapag-Lloyd', 5, 5),
  one: tariff('ONE', 4, 5),
  'ocean network express': tariff('ONE', 4, 5),
  evergreen: tariff('Evergreen', 4, 5),
  cosco: tariff('COSCO', 5, 5),
  'yang ming': tariff('Yang Ming', 4, 5),
  hmm: tariff('HMM', 4, 5),
  zim: tariff('ZIM', 4, 4),
  // Jones Act domestic carriers (AI-12014) run their own, longer free time.
  matson: tariff('Matson', 5, 5),
  'pasha hawaii': tariff('Pasha Hawaii', 5, 5),
  pasha: tariff('Pasha Hawaii', 5, 5),
  crowley: tariff('Crowley', 5, 5),
  'tote maritime': tariff('TOTE Maritime', 5, 5),
};

/** Resolve a carrier name to its tariff, falling back to the market default. */
export function getTariff(carrier: string | null | undefined): DemurrageTariff {
  const key = (carrier ?? '').trim().toLowerCase();
  if (!key) return DEFAULT_TARIFF;
  if (CARRIER_TARIFFS[key]) return CARRIER_TARIFFS[key];
  for (const [name, t] of Object.entries(CARRIER_TARIFFS)) {
    if (key.includes(name)) return t;
  }
  return DEFAULT_TARIFF;
}

// ─── Day math ─────────────────────────────────────────────────

const DAY_MS = 86_400_000;

/**
 * Add `days` of free time to `start`.
 *
 * On a `working` basis, Saturdays and Sundays do not consume free time —
 * a Thursday discharge with 4 working days runs to the following Wednesday,
 * not to Monday. Getting this wrong warns two days late, which is exactly
 * when it is too late to do anything about it.
 */
export function addFreeDays(start: Date, days: number, basis: DayBasis): Date {
  if (basis === 'calendar') return new Date(start.getTime() + days * DAY_MS);

  const out = new Date(start.getTime());
  let remaining = days;
  while (remaining > 0) {
    out.setTime(out.getTime() + DAY_MS);
    const dow = out.getUTCDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return out;
}

/** Whole days between two instants, rounded toward zero. */
function wholeDaysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

/**
 * Total charge for `chargeableDays` days against a tiered tariff.
 * Tiers are cumulative: day 7 on a 1-5 / 6-10 schedule pays 5 days at the
 * first rate plus 2 at the second, not 7 at the second.
 */
export function chargeForDays(tiers: TariffTier[], chargeableDays: number): number {
  if (chargeableDays <= 0) return 0;
  let total = 0;
  for (const tier of tiers) {
    if (chargeableDays < tier.fromDay) break;
    const last = tier.toDay ?? chargeableDays;
    const daysInTier = Math.min(chargeableDays, last) - tier.fromDay + 1;
    if (daysInTier > 0) total += daysInTier * tier.perDiemUsd;
  }
  return total;
}

/** The per-day rate that applies on day `dayNumber` past free time. */
export function perDiemOnDay(tiers: TariffTier[], dayNumber: number): number {
  if (dayNumber <= 0) return 0;
  for (const tier of tiers) {
    const last = tier.toDay ?? Infinity;
    if (dayNumber >= tier.fromDay && dayNumber <= last) return tier.perDiemUsd;
  }
  return tiers[tiers.length - 1]?.perDiemUsd ?? 0;
}

// ─── Milestone extraction ─────────────────────────────────────

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function firstDate(meta: Record<string, unknown>, keys: string[]): Date | null {
  for (const key of keys) {
    const d = parseDate(meta[key]);
    if (d) return d;
  }
  return null;
}

/**
 * Pull container milestones out of a shipment row.
 *
 * Discharge is read from any of the keys a feed might use. When none is
 * present we fall back to ETA so the meter still gives an answer on the
 * manual/CSV rows that make up most of the table today — flagged
 * `dischargeIsEstimated` so nothing presents a guess as an event.
 */
export function readMilestones(
  importMeta: unknown,
  eta: Date | string | null | undefined
): ContainerMilestones {
  const meta =
    importMeta && typeof importMeta === 'object'
      ? (importMeta as Record<string, unknown>)
      : {};

  const discharged = firstDate(meta, [
    'dischargedAt',
    'discharged_at',
    'availableAt',
    'available_at',
    'arrivedAt',
    'actualArrival',
    'ata',
  ]);

  const fallback = discharged ? null : parseDate(eta);

  return {
    dischargedAt: discharged ?? fallback,
    gateOutAt: firstDate(meta, ['gateOutAt', 'gate_out_at', 'pickedUpAt', 'gateOut']),
    emptyReturnedAt: firstDate(meta, [
      'emptyReturnedAt',
      'empty_returned_at',
      'emptyReturn',
      'returnedAt',
    ]),
    dischargeIsEstimated: !discharged && fallback !== null,
  };
}

/** Per-shipment tariff overrides stashed in importMeta. */
export function readTariffOverride(
  importMeta: unknown,
  carrier: string | null | undefined
): DemurrageTariff {
  const base = getTariff(carrier);
  const meta =
    importMeta && typeof importMeta === 'object'
      ? (importMeta as Record<string, unknown>)
      : {};

  const raw = meta.demurrageTariff;
  const override = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;

  const demurrageFreeDays = num(
    override.demurrageFreeDays ?? meta.demurrageFreeDays ?? meta.freeDays,
    base.demurrageFreeDays
  );
  const detentionFreeDays = num(
    override.detentionFreeDays ?? meta.detentionFreeDays,
    base.detentionFreeDays
  );
  const dayBasis: DayBasis =
    override.dayBasis === 'working' || override.dayBasis === 'calendar'
      ? override.dayBasis
      : base.dayBasis;

  const hasOverride =
    demurrageFreeDays !== base.demurrageFreeDays ||
    detentionFreeDays !== base.detentionFreeDays ||
    dayBasis !== base.dayBasis;

  return {
    ...base,
    demurrageFreeDays,
    detentionFreeDays,
    dayBasis,
    source: hasOverride ? 'contract' : base.source,
  };
}

// ─── Risk assessment ──────────────────────────────────────────

export interface AssessOptions {
  tariff?: DemurrageTariff;
  containerCount?: number;
  /** Days of remaining free time below which we call it a warning. */
  warningDays?: number;
  /** Days of remaining free time below which we call it critical. */
  criticalDays?: number;
}

const WARNING_DAYS = 3;
const CRITICAL_DAYS = 1;

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function usd(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/**
 * Assess demurrage / detention exposure for one container as of `now`.
 *
 * Resolution order matters: the empty being back ends everything, gate-out
 * switches the running clock from demurrage to detention, and no discharge
 * event at all means the clock has not started.
 */
export function assessDemurrageRisk(
  milestones: ContainerMilestones,
  options: AssessOptions = {},
  now: Date = new Date()
): DemurrageRisk {
  const t = options.tariff ?? DEFAULT_TARIFF;
  const containerCount = Math.max(1, options.containerCount ?? 1);
  const warningDays = options.warningDays ?? WARNING_DAYS;
  const criticalDays = options.criticalDays ?? CRITICAL_DAYS;

  const base = {
    containerCount,
    tariff: t,
    estimated: milestones.dischargeIsEstimated,
  };

  // Empty is back — both clocks stopped, nothing further can accrue.
  if (milestones.emptyReturnedAt) {
    return {
      ...base,
      clock: 'clear',
      riskLevel: 'clear',
      freeTimeExpiresAt: null,
      daysRemaining: null,
      chargeableDays: 0,
      accruedUsd: 0,
      projectedUsd7d: 0,
      perDiemUsd: 0,
      estimated: false,
      headline: 'Empty returned',
      detail: `Container returned ${fmtDate(milestones.emptyReturnedAt)}. No further demurrage or detention can accrue.`,
    };
  }

  // Nothing has arrived yet — the clock has not started.
  if (!milestones.dischargedAt) {
    return {
      ...base,
      clock: 'pending',
      riskLevel: 'clear',
      freeTimeExpiresAt: null,
      daysRemaining: null,
      chargeableDays: 0,
      accruedUsd: 0,
      projectedUsd7d: 0,
      perDiemUsd: 0,
      headline: 'Awaiting arrival',
      detail: 'No discharge or arrival event recorded yet, so free time has not started.',
    };
  }

  // Which clock is running, and from when.
  const onDetention = milestones.gateOutAt !== null;
  const clockStart = onDetention ? milestones.gateOutAt! : milestones.dischargedAt;
  const freeDays = onDetention ? t.detentionFreeDays : t.demurrageFreeDays;
  const tiers = onDetention ? t.detentionTiers : t.demurrageTiers;

  const freeTimeExpiresAt = addFreeDays(clockStart, freeDays, t.dayBasis);
  const daysRemaining = wholeDaysBetween(now, freeTimeExpiresAt);
  const chargeableDays = Math.max(0, wholeDaysBetween(freeTimeExpiresAt, now));

  const perContainerAccrued = chargeForDays(tiers, chargeableDays);
  const perContainerIn7d = chargeForDays(tiers, Math.max(0, chargeableDays + 7));
  const accruedUsd = perContainerAccrued * containerCount;
  const projectedUsd7d = perContainerIn7d * containerCount;
  const perDiemUsd = perDiemOnDay(tiers, chargeableDays);

  let riskLevel: RiskLevel;
  if (chargeableDays > 0) riskLevel = 'accruing';
  else if (daysRemaining <= criticalDays) riskLevel = 'critical';
  else if (daysRemaining <= warningDays) riskLevel = 'warning';
  else riskLevel = 'safe';

  const clockLabel = onDetention ? 'Detention' : 'Demurrage';
  const action = onDetention ? 'Return the empty' : 'Pick the container up';

  let headline: string;
  let detail: string;

  if (riskLevel === 'accruing') {
    headline = `${clockLabel} accruing — ${usd(accruedUsd)}`;
    detail =
      `Free time ran out ${fmtDate(freeTimeExpiresAt)} (${chargeableDays} chargeable ` +
      `${chargeableDays === 1 ? 'day' : 'days'}). Now ${usd(perDiemUsd)}/container/day; ` +
      `${usd(projectedUsd7d)} if it sits another week. ${action} to stop the clock.`;
  } else {
    headline =
      daysRemaining === 0
        ? `${clockLabel} free time ends today`
        : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} of ${clockLabel.toLowerCase()} free time left`;
    detail =
      `Free time expires ${fmtDate(freeTimeExpiresAt)} ` +
      `(${freeDays} ${t.dayBasis} ${freeDays === 1 ? 'day' : 'days'} from ` +
      `${onDetention ? 'gate-out' : 'discharge'} ${fmtDate(clockStart)}). ` +
      `${action} before then or charges start at ` +
      `${usd(perDiemOnDay(tiers, 1))}/container/day.`;
  }

  if (milestones.dischargeIsEstimated && !onDetention) {
    detail += ' Countdown is based on ETA — no actual discharge event recorded yet.';
  }

  return {
    ...base,
    clock: onDetention ? 'detention' : 'demurrage',
    riskLevel,
    freeTimeExpiresAt,
    daysRemaining,
    chargeableDays,
    accruedUsd,
    projectedUsd7d,
    perDiemUsd,
    headline,
    detail,
  };
}

// ─── Alert selection ──────────────────────────────────────────

export interface DemurrageShipmentRow {
  id: string;
  orgId: string | null;
  containerNumber: string | null;
  reference: string | null;
  carrier: string | null;
  containerCount: number | null;
  eta: Date | string | null;
  status: string;
  importMeta: unknown;
}

export interface DueDemurrageAlert {
  shipmentId: string;
  orgId: string;
  /** Dedupe key: one alert per clock per escalation stage. */
  stage: string;
  clock: DemurrageClock;
  riskLevel: RiskLevel;
  label: string;
  risk: DemurrageRisk;
}

/**
 * `delivered` does NOT stop the detention clock — the box is with the
 * consignee, but the carrier's container is still off-dock until the empty
 * comes back. Only `emptyReturnedAt` truly closes the exposure, and
 * `assessDemurrageRisk` already handles that.
 *
 * The one case we do skip on status is a `delivered` shipment whose countdown
 * is only an ETA estimate: with no real discharge or gate-out event there is
 * nothing to stand behind an alert, and every historical row with a past ETA
 * would otherwise page someone forever.
 */
function isStale(row: DemurrageShipmentRow, risk: DemurrageRisk): boolean {
  return row.status === 'delivered' && risk.estimated && risk.clock !== 'detention';
}

/** Stages worth waking someone up for, in escalation order. */
const ALERTABLE: ReadonlySet<RiskLevel> = new Set<RiskLevel>([
  'warning',
  'critical',
  'accruing',
]);

function alertsSent(meta: Record<string, unknown>): Record<string, string> {
  const raw = meta.demurrageAlertsSent;
  return raw && typeof raw === 'object' ? (raw as Record<string, string>) : {};
}

/**
 * Which shipments need a demurrage/detention alert right now.
 *
 * Dedupe is keyed by `${clock}:${riskLevel}` rather than by shipment, so a box
 * escalating safe -> warning -> critical -> accruing pings once per step
 * instead of once ever. Without the escalation key an early "3 days left"
 * warning would suppress the "you are now paying $400/day" one, which is the
 * alert that actually matters.
 */
export function findDueDemurrageAlerts(
  rows: DemurrageShipmentRow[],
  now: Date = new Date()
): DueDemurrageAlert[] {
  const due: DueDemurrageAlert[] = [];

  for (const row of rows) {
    if (!row.orgId) continue;

    const meta =
      row.importMeta && typeof row.importMeta === 'object'
        ? (row.importMeta as Record<string, unknown>)
        : {};

    const milestones = readMilestones(row.importMeta, row.eta);
    const risk = assessDemurrageRisk(
      milestones,
      {
        tariff: readTariffOverride(row.importMeta, row.carrier),
        containerCount: row.containerCount ?? 1,
      },
      now
    );

    if (isStale(row, risk)) continue;
    if (!ALERTABLE.has(risk.riskLevel)) continue;

    const stage = `${risk.clock}:${risk.riskLevel}`;
    if (alertsSent(meta)[stage]) continue;

    due.push({
      shipmentId: row.id,
      orgId: row.orgId,
      stage,
      clock: risk.clock,
      riskLevel: risk.riskLevel,
      label: row.containerNumber ?? row.reference ?? 'Shipment',
      risk,
    });
  }

  return due;
}

/** Push copy for one due demurrage/detention alert. */
export function demurrageMessage(d: DueDemurrageAlert): { title: string; body: string } {
  const icon = d.riskLevel === 'accruing' ? '🔴' : d.riskLevel === 'critical' ? '🟠' : '🟡';
  const clockLabel = d.clock === 'detention' ? 'Detention' : 'Demurrage';

  const title =
    d.riskLevel === 'accruing'
      ? `${icon} ${clockLabel} accruing — ${d.label}`
      : `${icon} ${clockLabel}: ${d.risk.daysRemaining}d free time left — ${d.label}`;

  return { title, body: `${d.label}: ${d.risk.detail}` };
}
