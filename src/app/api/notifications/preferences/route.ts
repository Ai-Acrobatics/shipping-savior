import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  digestFrequencyEnum,
  notificationPreferences,
  notificationSeverityEnum,
  notificationTypeEnum,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  DEFAULT_PREFERENCES,
  DIGEST_LABELS,
  NOTIFICATION_TYPE_LABELS,
  SEVERITY_LABELS,
  resolvePreferences,
} from "@/lib/notifications/preferences";
import type { DigestFrequency, NotificationSeverity } from "@/lib/db/schema";

/**
 * GET/PUT /api/notifications/preferences — per-user alert rules (AI-12013).
 *
 * Preferences are keyed (user, org): the same person can want everything
 * from their own book of business and only critical alerts from another org.
 * There is no row until the user saves one — GET falls back to the code
 * defaults so changing a default doesn't need a backfill.
 */

const TYPES = notificationTypeEnum.enumValues;
const SEVERITIES = notificationSeverityEnum.enumValues;
const FREQUENCIES = digestFrequencyEnum.enumValues;

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  try {
    const [stored] = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.orgId, orgId)
        )
      )
      .limit(1);

    return NextResponse.json({
      preferences: resolvePreferences(
        stored
          ? {
              mutedTypes: (stored.mutedTypes ?? []) as typeof TYPES[number][],
              minSeverity: stored.minSeverity,
              inAppEnabled: stored.inAppEnabled,
              pushEnabled: stored.pushEnabled,
              emailDigest: stored.emailDigest,
              quietHoursStart: stored.quietHoursStart,
              quietHoursEnd: stored.quietHoursEnd,
              timezone: stored.timezone,
              digestLastSentAt: stored.digestLastSentAt,
            }
          : null
      ),
      isDefault: !stored,
      options: {
        types: TYPES,
        typeLabels: NOTIFICATION_TYPE_LABELS,
        severities: SEVERITIES,
        severityLabels: SEVERITY_LABELS,
        frequencies: FREQUENCIES,
        frequencyLabels: DIGEST_LABELS,
      },
    });
  } catch (error) {
    console.error("Failed to load notification preferences:", error);
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}

/** Hour-of-day or null. Rejects anything outside 0-23 rather than clamping. */
function parseHour(value: unknown, field: string): number | null | { error: string } {
  if (value === null || value === undefined || value === "") return null;
  const hour = Number(value);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { error: `${field} must be an integer hour between 0 and 23` };
  }
  return hour;
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orgId, id: userId } = session.user;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const mutedTypes = body.mutedTypes ?? DEFAULT_PREFERENCES.mutedTypes;
  if (!Array.isArray(mutedTypes) || mutedTypes.some((t) => !(TYPES as readonly unknown[]).includes(t))) {
    return NextResponse.json(
      { error: `mutedTypes must be an array of: ${TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const minSeverity = (body.minSeverity ?? DEFAULT_PREFERENCES.minSeverity) as NotificationSeverity;
  if (!(SEVERITIES as readonly string[]).includes(minSeverity)) {
    return NextResponse.json(
      { error: `minSeverity must be one of: ${SEVERITIES.join(", ")}` },
      { status: 400 }
    );
  }

  const emailDigest = (body.emailDigest ?? DEFAULT_PREFERENCES.emailDigest) as DigestFrequency;
  if (!(FREQUENCIES as readonly string[]).includes(emailDigest)) {
    return NextResponse.json(
      { error: `emailDigest must be one of: ${FREQUENCIES.join(", ")}` },
      { status: 400 }
    );
  }

  const start = parseHour(body.quietHoursStart, "quietHoursStart");
  if (start && typeof start === "object") {
    return NextResponse.json({ error: start.error }, { status: 400 });
  }
  const end = parseHour(body.quietHoursEnd, "quietHoursEnd");
  if (end && typeof end === "object") {
    return NextResponse.json({ error: end.error }, { status: 400 });
  }
  // Quiet hours are a range: one bound without the other is a half-configured
  // rule that would silently never fire. Reject it instead.
  if ((start === null) !== (end === null)) {
    return NextResponse.json(
      { error: "quietHoursStart and quietHoursEnd must be set together, or both cleared" },
      { status: 400 }
    );
  }

  const timezone =
    typeof body.timezone === "string" && body.timezone.trim()
      ? body.timezone.trim().slice(0, 64)
      : DEFAULT_PREFERENCES.timezone;
  try {
    // Validate the IANA zone here rather than discovering it's bogus inside
    // the quiet-hours check, where the failure mode is a silent UTC fallback.
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    return NextResponse.json({ error: "timezone must be a valid IANA zone" }, { status: 400 });
  }

  const values = {
    userId,
    orgId,
    mutedTypes: mutedTypes as string[],
    minSeverity,
    inAppEnabled: body.inAppEnabled !== false,
    pushEnabled: body.pushEnabled !== false,
    emailDigest,
    quietHoursStart: start as number | null,
    quietHoursEnd: end as number | null,
    timezone,
    updatedAt: new Date(),
  };

  try {
    const [saved] = await db
      .insert(notificationPreferences)
      .values(values)
      .onConflictDoUpdate({
        target: [notificationPreferences.userId, notificationPreferences.orgId],
        set: values,
      })
      .returning();

    return NextResponse.json({ preferences: saved });
  } catch (error) {
    console.error("Failed to save notification preferences:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
