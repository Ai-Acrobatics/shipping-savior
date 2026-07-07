"use client";

import { useState, useMemo } from "react";
import {
  Ship, Anchor, Building2, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Clock, Package, Truck,
  CheckCircle2, AlertTriangle, XCircle, Play, Circle,
} from "lucide-react";

// ─── Location Config ────────────────────────────────────────────

const LOCATIONS = {
  port_hueneme: {
    label: "Port Hueneme",
    subtitle: "Wainimi Cross-Dock",
    color: "border-ocean-500 bg-ocean-50",
    icon: Anchor,
  },
  anacapa: {
    label: "ANACAPA",
    subtitle: "Interchange Terminal",
    color: "border-amber-500 bg-amber-50",
    icon: Building2,
  },
  kingsco: {
    label: "KINGSCO",
    subtitle: "Chiquita Export Hub",
    color: "border-emerald-500 bg-emerald-50",
    icon: Ship,
  },
} as const;

type LocationKey = keyof typeof LOCATIONS;

// ─── Types ──────────────────────────────────────────────────────

type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

interface Appointment {
  id: string;
  location: LocationKey;
  appointmentDate: string;
  timeSlot: string;
  carrier: string;
  vesselName?: string | null;
  voyageNumber?: string | null;
  containerCount: number;
  containerNumbers?: string[] | null;
  reference?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
}

// ─── Demo Data ──────────────────────────────────────────────────

function generateDemoAppointments(): Appointment[] {
  const today = new Date();
  const t = (daysOffset: number, hours: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  const timeSlots = ["06:00-08:00", "08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"];
  const carriers = ["Hall Pass Drayage", "Kingsco Logistics", "Great White Fleet", "Chiquita Fresh", "Maersk Line"];
  const vessels = ["MSC AURORA", "EVER FORTUNE", "CMA CGM RIGOLETTO", null, null];

  const appointments: Appointment[] = [];
  let id = 1;

  const locations: LocationKey[] = ["port_hueneme", "anacapa", "kingsco"];

  for (const loc of locations) {
    for (let day = -1; day <= 5; day++) {
      // 2-4 appointments per location per day
      const count = 2 + Math.floor(Math.random() * 3);
      const usedSlots = new Set<string>();

      for (let a = 0; a < count; a++) {
        const available = timeSlots.filter(s => !usedSlots.has(s));
        if (available.length === 0) break;
        const slot = available[Math.floor(Math.random() * available.length)];
        usedSlots.add(slot);

        const ci = Math.floor(Math.random() * carriers.length);
        const statuses: AppointmentStatus[] = ["scheduled", "scheduled", "scheduled", "checked_in", "in_progress", "completed"];
        const status = day < 0 ? "completed" : day === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : "scheduled";

        appointments.push({
          id: `demo-${id++}`,
          location: loc,
          appointmentDate: t(day, 0),
          timeSlot: slot,
          carrier: carriers[ci],
          vesselName: vessels[ci],
          voyageNumber: vessels[ci] ? `V${100 + Math.floor(Math.random() * 900)}` : null,
          containerCount: 1 + Math.floor(Math.random() * 5),
          containerNumbers: Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () =>
            `TGHU${800000 + Math.floor(Math.random() * 999999)}`,
          ),
          reference: `BK-${20000 + Math.floor(Math.random() * 99999)}`,
          status,
        });
      }
    }
  }

  return appointments;
}

// ─── Status Badge ───────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config: Record<AppointmentStatus, { label: string; color: string; icon: typeof Circle }> = {
    scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-600 border-blue-200", icon: CalendarIcon },
    checked_in: { label: "Checked In", color: "bg-purple-50 text-purple-600 border-purple-200", icon: Play },
    in_progress: { label: "In Progress", color: "bg-ocean-50 text-ocean-600 border-ocean-200", icon: Truck },
    completed: { label: "Completed", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
    no_show: { label: "No Show", color: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertTriangle },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${c.color}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Appointment Card ───────────────────────────────────────────

function AppointmentCard({ apt }: { apt: Appointment }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white border border-navy-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-900 truncate">{apt.carrier}</p>
          {apt.vesselName && (
            <p className="text-xs text-navy-500 truncate">{apt.vesselName}{apt.voyageNumber ? ` · ${apt.voyageNumber}` : ""}</p>
          )}
          {!apt.vesselName && apt.reference && (
            <p className="text-xs text-navy-400 truncate">{apt.reference}</p>
          )}
        </div>
        <StatusBadge status={apt.status} />
      </div>

      <div className="flex items-center gap-3 mt-2 text-xs text-navy-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {apt.timeSlot}
        </span>
        <span className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {apt.containerCount} container{apt.containerCount !== 1 ? "s" : ""}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-navy-100 space-y-1.5">
          {apt.containerNumbers && apt.containerNumbers.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">Containers</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {apt.containerNumbers.map((cn) => (
                  <span key={cn} className="text-[10px] bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded font-mono">
                    {cn}
                  </span>
                ))}
              </div>
            </div>
          )}
          {apt.reference && (
            <p className="text-xs text-navy-500">
              <span className="font-medium">Ref:</span> {apt.reference}
            </p>
          )}
          {apt.notes && (
            <p className="text-xs text-navy-400 italic">{apt.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Time Slot Row ──────────────────────────────────────────────

const TIME_SLOTS = ["06:00-08:00", "08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"];

// ─── Main Page ──────────────────────────────────────────────────

export default function CrossDockPage() {
  const demoAppointments = useMemo(() => generateDemoAppointments(), []);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | "all">("all");

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const dateStr = selectedDate.toISOString().split("T")[0];

  // Filter appointments for the selected date + location
  const filteredAppointments = useMemo(() => {
    return demoAppointments.filter((apt) => {
      const aptDate = apt.appointmentDate.split("T")[0];
      const dateMatch = aptDate === dateStr;
      const locMatch = selectedLocation === "all" || apt.location === selectedLocation;
      return dateMatch && locMatch;
    });
  }, [demoAppointments, dateStr, selectedLocation]);

  // Group appointments by location + timeSlot
  const grouped = useMemo(() => {
    const map: Record<string, Record<string, Appointment[]>> = {};
    const locs = selectedLocation === "all"
      ? (["port_hueneme", "anacapa", "kingsco"] as LocationKey[])
      : [selectedLocation];

    for (const loc of locs) {
      map[loc] = {};
      for (const slot of TIME_SLOTS) {
        map[loc][slot] = [];
      }
    }

    for (const apt of filteredAppointments) {
      if (map[apt.location]?.[apt.timeSlot]) {
        map[apt.location][apt.timeSlot].push(apt);
      }
    }
    return map;
  }, [filteredAppointments, selectedLocation]);

  const locations = selectedLocation === "all"
    ? (["port_hueneme", "anacapa", "kingsco"] as LocationKey[])
    : [selectedLocation];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Cross-Dock Appointments</h1>
          <p className="text-sm text-navy-500 mt-1">
            Calendar / lane view · Port Hueneme, ANACAPA, KINGSCO
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as LocationKey | "all")}
            className="text-sm border border-navy-200 rounded-lg px-3 py-2 bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            <option value="all">All Locations</option>
            <option value="port_hueneme">Port Hueneme</option>
            <option value="anacapa">ANACAPA</option>
            <option value="kingsco">KINGSCO</option>
          </select>

          {/* Date Picker */}
          <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-lg">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d);
              }}
              className="p-2 hover:bg-navy-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-navy-500" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date(new Date().setHours(0, 0, 0, 0)))}
              className="text-sm font-medium text-navy-700 px-3 py-2 hover:bg-navy-50 transition-colors min-w-[140px]"
            >
              {formatDate(selectedDate)}
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d);
              }}
              className="p-2 hover:bg-navy-50 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-navy-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {locations.map((loc) => {
          const count = filteredAppointments.filter(a => a.location === loc).length;
          const config = LOCATIONS[loc];
          const Icon = config.icon;
          return (
            <button
              key={loc}
              onClick={() => setSelectedLocation(selectedLocation === loc ? "all" : loc)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedLocation === loc || selectedLocation === "all"
                  ? `${config.color} border-current`
                  : "border-navy-100 bg-white opacity-60"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-navy-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-navy-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-navy-900">{config.label}</p>
                <p className="text-2xl font-bold text-navy-900">{count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lane View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const config = LOCATIONS[loc];
          const Icon = config.icon;

          return (
            <div key={loc} className="bg-navy-50/50 rounded-xl border border-navy-100 overflow-hidden">
              {/* Lane Header */}
              <div className="bg-white border-b border-navy-100 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-navy-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-900">{config.label}</h3>
                  <p className="text-[11px] text-navy-400">{config.subtitle}</p>
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-3 space-y-3">
                {TIME_SLOTS.map((slot) => {
                  const apps = grouped[loc]?.[slot] ?? [];

                  return (
                    <div key={slot}>
                      {/* Slot Label */}
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-navy-400" />
                        <span className="text-[11px] font-medium text-navy-500 uppercase tracking-wide">{slot}</span>
                        {apps.length > 0 && (
                          <span className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded-full font-semibold">
                            {apps.length}
                          </span>
                        )}
                      </div>

                      {/* Appointments */}
                      <div className="space-y-2">
                        {apps.length === 0 && (
                          <p className="text-xs text-navy-300 italic pl-5">No appointments</p>
                        )}
                        {apps.map((apt) => (
                          <AppointmentCard key={apt.id} apt={apt} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
