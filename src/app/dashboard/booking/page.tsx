"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import {
  Ship,
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  Calendar,
  Thermometer,
  Box,
  CheckCircle2,
  ChevronDown,
  Globe,
  DollarSign,
  Clock,
  Shield,
  AlertCircle,
  Anchor,
  Truck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CargoType = "general" | "cold-chain" | "hazmat" | "oversized";
type Modality = "ocean" | "air" | "rail" | "drayage";

interface BookingForm {
  origin: string;
  destination: string;
  cargoType: CargoType;
  modality: Modality;
  weight: string;
  volume: string;
  containers: string;
  cargoDescription: string;
  pickupDate: string;
  deliveryDate: string;
  tempMin: string;
  tempMax: string;
  declaredValue: string;
  insurance: boolean;
  hazmatClass: string;
  specialInstructions: string;
}

const DEMO_ROUTES = [
  { label: "Shanghai (CNSHA) -> Los Angeles (USLAX)", origin: "Shanghai, China (CNSHA)", destination: "Los Angeles, CA (USLAX)" },
  { label: "Ho Chi Minh City (VNSGN) -> Long Beach (USLGB)", origin: "Ho Chi Minh City, Vietnam (VNSGN)", destination: "Long Beach, CA (USLGB)" },
  { label: "Bangkok (THBKK) -> Oakland (USOAK)", origin: "Bangkok, Thailand (THBKK)", destination: "Oakland, CA (USOAK)" },
  { label: "Jakarta (IDJKT) -> Seattle (USSEA)", origin: "Jakarta, Indonesia (IDJKT)", destination: "Seattle, WA (USSEA)" },
  { label: "Seattle (USSEA) -> Anchorage (USANH)", origin: "Seattle, WA (USSEA)", destination: "Anchorage, AK (USANH)" },
];

const DEMO_QUOTES = [
  {
    carrier: "COSCO Shipping",
    modality: "ocean",
    rate: "$1,850",
    unit: "/TEU",
    transit: "16 days",
    eta: "May 7, 2026",
    reliability: 94,
    savings: null,
    recommended: true,
    icon: Anchor,
  },
  {
    carrier: "Evergreen Marine",
    modality: "ocean",
    rate: "$1,720",
    unit: "/TEU",
    transit: "19 days",
    eta: "May 10, 2026",
    reliability: 89,
    savings: "$130/TEU vs fastest",
    recommended: false,
    icon: Anchor,
  },
  {
    carrier: "MSC Mediterranean",
    modality: "ocean",
    rate: "$2,050",
    unit: "/TEU",
    transit: "14 days",
    eta: "May 5, 2026",
    reliability: 96,
    savings: null,
    recommended: false,
    icon: Ship,
  },
];

// ─── Step Components ───────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i < step ? "bg-emerald-500 text-white" :
            i === step ? "bg-ocean-600 text-white ring-4 ring-ocean-100" :
            "bg-navy-100 text-navy-400"
          }`}>
            {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 rounded-full transition-all ${i < step ? "bg-emerald-400" : "bg-navy-100"}`} />
          )}
        </div>
      ))}
      <div className="ml-3 text-sm text-navy-500">
        Step {step + 1} of {total}
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500 normal-case">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy-900 pr-10 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
    />
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<BookingForm>({
    origin: "",
    destination: "",
    cargoType: "general",
    modality: "ocean",
    weight: "",
    volume: "",
    containers: "1",
    cargoDescription: "",
    pickupDate: "",
    deliveryDate: "",
    tempMin: "-18",
    tempMax: "4",
    declaredValue: "",
    insurance: false,
    hazmatClass: "",
    specialInstructions: "",
  });

  const set = (key: keyof BookingForm) => (val: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const steps = [
    "Route & Cargo",
    "Details & Dates",
    "Get Quotes",
    "Confirm",
  ];

  const cargoTypeOptions = [
    { value: "general", label: "General Cargo" },
    { value: "cold-chain", label: "Cold Chain / Refrigerated" },
    { value: "hazmat", label: "Hazardous Materials" },
    { value: "oversized", label: "Oversized / Project Cargo" },
  ];

  const modalityOptions = [
    { value: "ocean", label: "Ocean Freight (FCL/LCL)" },
    { value: "air", label: "Air Freight" },
    { value: "rail", label: "Rail" },
    { value: "drayage", label: "Drayage (Short Haul)" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-ocean-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold text-navy-900">Book a Shipment</h1>
        <p className="text-sm text-navy-500 mt-1">Get instant quotes from 20+ carriers across ocean, air, rail, and drayage.</p>
      </div>

      {/* DEMO Badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span><strong>DEMO</strong> — This booking flow uses realistic mock data. Live carrier integration coming in Phase 3.</span>
      </div>

      {!submitted ? (
        <div className="bg-white border border-navy-100 rounded-2xl p-8 shadow-soft">
          <StepIndicator step={step} total={steps.length} />

          {/* Step 0: Route & Cargo */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Route & Cargo Type</h2>

              <FormField label="Quick Route" >
                <SelectInput
                  value=""
                  onChange={(v) => {
                    const route = DEMO_ROUTES.find(r => r.label === v);
                    if (route) {
                      setForm(prev => ({ ...prev, origin: route.origin, destination: route.destination }));
                    }
                  }}
                  options={[{ value: "", label: "-- Select a common route --" }, ...DEMO_ROUTES.map(r => ({ value: r.label, label: r.label }))]}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Origin Port / City" required>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      value={form.origin}
                      onChange={e => set("origin")(e.target.value)}
                      placeholder="Shanghai, China (CNSHA)"
                      className="w-full bg-white border border-navy-200 rounded-xl pl-9 pr-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
                    />
                  </div>
                </FormField>
                <FormField label="Destination" required>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      value={form.destination}
                      onChange={e => set("destination")(e.target.value)}
                      placeholder="Los Angeles, CA (USLAX)"
                      className="w-full bg-white border border-navy-200 rounded-xl pl-9 pr-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
                    />
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Cargo Type" required>
                  <SelectInput
                    value={form.cargoType}
                    onChange={set("cargoType")}
                    options={cargoTypeOptions}
                  />
                </FormField>
                <FormField label="Mode of Transport" required>
                  <SelectInput
                    value={form.modality}
                    onChange={set("modality")}
                    options={modalityOptions}
                  />
                </FormField>
              </div>

              {/* Cold chain temp range */}
              {form.cargoType === "cold-chain" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Cold Chain Requirements</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Min Temp (°C)">
                      <TextInput value={form.tempMin} onChange={set("tempMin")} placeholder="-18" type="number" />
                    </FormField>
                    <FormField label="Max Temp (°C)">
                      <TextInput value={form.tempMax} onChange={set("tempMax")} placeholder="4" type="number" />
                    </FormField>
                  </div>
                </div>
              )}

              {form.cargoType === "hazmat" && (
                <FormField label="Hazmat Class">
                  <SelectInput
                    value={form.hazmatClass}
                    onChange={set("hazmatClass")}
                    options={[
                      { value: "", label: "-- Select class --" },
                      { value: "1", label: "Class 1 — Explosives" },
                      { value: "2", label: "Class 2 — Gases" },
                      { value: "3", label: "Class 3 — Flammable Liquids" },
                      { value: "4", label: "Class 4 — Flammable Solids" },
                      { value: "5", label: "Class 5 — Oxidizers" },
                      { value: "6", label: "Class 6 — Toxic Substances" },
                      { value: "8", label: "Class 8 — Corrosives" },
                      { value: "9", label: "Class 9 — Miscellaneous" },
                    ]}
                  />
                </FormField>
              )}
            </div>
          )}

          {/* Step 1: Details & Dates */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-navy-900 mb-4">Cargo Details & Dates</h2>

              <FormField label="Cargo Description" required>
                <textarea
                  value={form.cargoDescription}
                  onChange={e => set("cargoDescription")(e.target.value)}
                  placeholder="e.g. Frozen fruit (Chiquita export), 1x 40' reefer..."
                  rows={3}
                  className="w-full bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all resize-none"
                />
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Containers" required>
                  <SelectInput
                    value={form.containers}
                    onChange={set("containers")}
                    options={[1,2,3,4,5,6,8,10].map(n => ({ value: String(n), label: `${n} × 40' container${n > 1 ? "s" : ""}` }))}
                  />
                </FormField>
                <FormField label="Total Weight (kg)">
                  <TextInput value={form.weight} onChange={set("weight")} placeholder="22,000" type="text" />
                </FormField>
                <FormField label="Volume (CBM)">
                  <TextInput value={form.volume} onChange={set("volume")} placeholder="67.7" type="text" />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Cargo Ready Date" required>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={e => set("pickupDate")(e.target.value)}
                      className="w-full bg-white border border-navy-200 rounded-xl pl-9 pr-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
                    />
                  </div>
                </FormField>
                <FormField label="Required Delivery By">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="date"
                      value={form.deliveryDate}
                      onChange={e => set("deliveryDate")(e.target.value)}
                      className="w-full bg-white border border-navy-200 rounded-xl pl-9 pr-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Declared Cargo Value (USD)">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="text"
                    value={form.declaredValue}
                    onChange={e => set("declaredValue")(e.target.value)}
                    placeholder="78,900"
                    className="w-full bg-white border border-navy-200 rounded-xl pl-9 pr-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all"
                  />
                </div>
              </FormField>

              <div className="flex items-center gap-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={form.insurance}
                  onChange={e => set("insurance")(e.target.checked)}
                  className="w-4 h-4 accent-ocean-600 rounded"
                />
                <label htmlFor="insurance" className="text-sm text-navy-700 cursor-pointer">
                  <span className="font-semibold">Add cargo insurance</span>
                  <span className="text-navy-500 ml-2">— covers declared value at ~0.3% rate</span>
                </label>
              </div>

              <FormField label="Special Instructions">
                <textarea
                  value={form.specialInstructions}
                  onChange={e => set("specialInstructions")(e.target.value)}
                  placeholder="e.g. ISF filing required, bonded warehouse delivery, FTZ entry..."
                  rows={2}
                  className="w-full bg-white border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/40 focus:border-ocean-400 transition-all resize-none"
                />
              </FormField>
            </div>
          )}

          {/* Step 2: Quotes */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-navy-900">Available Quotes</h2>
                <p className="text-sm text-navy-500 mt-1">
                  {form.origin || "Origin"} &rarr; {form.destination || "Destination"} &bull; {form.containers} container(s) &bull; {cargoTypeOptions.find(c => c.value === form.cargoType)?.label}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                DEMO rates — indicative only. Live quotes integrate with carrier APIs in Phase 3.
              </div>

              <div className="space-y-3">
                {DEMO_QUOTES.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => setStep(3)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-card ${
                      q.recommended
                        ? "border-ocean-300 bg-ocean-50/30 shadow-soft"
                        : "border-navy-100 bg-white shadow-soft hover:border-navy-200"
                    }`}
                  >
                    {q.recommended && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 bg-ocean-100 border border-ocean-200 px-2.5 py-1 rounded-full mb-3">
                        <Shield className="w-3 h-3" />
                        Recommended
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center">
                          <q.icon className="w-5 h-5 text-ocean-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-navy-900">{q.carrier}</div>
                          <div className="text-xs text-navy-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {q.transit} transit
                            <span>&bull;</span>
                            ETA {q.eta}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-navy-900">
                          {q.rate}<span className="text-xs text-navy-400 font-normal">{q.unit}</span>
                        </div>
                        {q.savings && (
                          <div className="text-xs text-emerald-600 font-medium">{q.savings}</div>
                        )}
                        <div className="text-xs text-navy-400 mt-0.5">
                          Reliability: <span className={q.reliability >= 93 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>{q.reliability}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <button className="text-xs text-ocean-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        Select this quote <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-navy-900">Confirm Booking</h2>

              <div className="bg-navy-50 border border-navy-100 rounded-2xl p-5 space-y-3">
                {[
                  { label: "Route", value: `${form.origin || "Shanghai, China"} → ${form.destination || "Los Angeles, CA"}` },
                  { label: "Cargo Type", value: cargoTypeOptions.find(c => c.value === form.cargoType)?.label },
                  { label: "Mode", value: modalityOptions.find(m => m.value === form.modality)?.label },
                  { label: "Containers", value: `${form.containers} × 40' container(s)` },
                  { label: "Carrier", value: "COSCO Shipping (Recommended)" },
                  { label: "Rate", value: "$1,850/TEU" },
                  { label: "Est. Transit", value: "16 days" },
                  { label: "ETA", value: "May 7, 2026" },
                  { label: "Insurance", value: form.insurance ? "Yes — cargo value covered" : "No" },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between text-sm">
                    <span className="text-navy-500 flex-shrink-0 w-32">{row.label}</span>
                    <span className="text-navy-900 font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                <strong>FTZ Opportunity:</strong> Destination is near FTZ Zone 202 (Los Angeles). Consider bonded entry to lock current duty rates.
                <Link href="/ftz-analyzer" className="ml-2 underline font-semibold">Analyze FTZ savings</Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-100">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 text-sm text-navy-600 hover:text-navy-900 border border-navy-200 px-4 py-2.5 rounded-xl hover:bg-navy-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 text-sm text-white font-semibold bg-gradient-to-r from-ocean-600 to-indigo-600 px-6 py-2.5 rounded-xl shadow-md hover:shadow-ocean-500/30 hover:scale-[1.02] transition-all"
              >
                {step === 1 ? "Get Quotes" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="flex items-center gap-2 text-sm text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 rounded-xl shadow-md hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Booking
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Success State */
        <div className="bg-white border border-navy-100 rounded-2xl p-12 shadow-soft text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Booking Confirmed!</h2>
          <p className="text-sm text-navy-500 max-w-sm mx-auto mb-2">
            Reference <strong className="text-navy-900">SS-2026-0042</strong> has been created. COSCO will confirm within 2 business hours.
          </p>
          <p className="text-xs text-navy-400 mb-8">ISF filing deadline: 24 hours before vessel departure.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-ocean-600 border border-ocean-200 bg-ocean-50 hover:bg-ocean-100 px-5 py-2.5 rounded-xl font-semibold transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Link href="/ftz-analyzer" className="flex items-center gap-2 text-sm text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl font-semibold transition-all">
              <Shield className="w-4 h-4" />
              Analyze FTZ Savings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
