"use client";

import { useState } from "react";

const milestones = [
  {
    id: "M1",
    title: "MVP Platform Foundation",
    status: "complete" as const,
    target: "Completed — March 2026",
    cost: "$2,000",
    deliverables: [
      "6 logistics calculators (Landed Cost, FTZ Savings, Tariff Scenarios, Container Utilization, Unit Economics, PF/NPF)",
      "Multi-tenant authentication with RBAC (NextAuth v5, JWT sessions)",
      "PostgreSQL database with Drizzle ORM (calculation persistence)",
      "Platform shell with sidebar navigation",
      "3,700+ ports, 200+ HTS codes, 260+ FTZ zones data assets",
      "AI Chatbot with Claude tool-use integration",
    ],
  },
  {
    id: "M2",
    title: "Carrier Intelligence System",
    status: "in-progress" as const,
    target: "Target: April 15, 2026",
    cost: "$1,500",
    deliverables: [
      "Shipping line schedule aggregator (Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd)",
      "Port-to-port carrier discovery with overlap detection",
      "Carrier performance and schedule reliability scoring",
      "Unified schedule search API",
    ],
  },
  {
    id: "M3",
    title: "Contract Management MVP",
    status: "planned" as const,
    target: "Target: April 25, 2026",
    cost: "$1,500",
    deliverables: [
      "Digital contract upload and storage system",
      "Lane visibility across all active contracts",
      "\"Booking on tariff\" detection and alerts",
      "Automated lane addition request workflow",
    ],
  },
  {
    id: "M4",
    title: "Investor Demo Ready",
    status: "planned" as const,
    target: "Target: May 8, 2026",
    cost: "$1,500",
    deliverables: [
      "Guided investor demo flow (Qingdao to Port of Los Angeles route)",
      "Executive dashboard with real analytics and KPIs",
      "PDF export capabilities for reports and comparisons",
      "Mobile responsiveness pass across all features",
      "End-to-end testing and production deployment",
    ],
  },
  {
    id: "M5",
    title: "Post-Investment Growth",
    status: "future" as const,
    target: "Q3 2026 (Post-Funding)",
    cost: "TBD — Funded by investment",
    deliverables: [
      "Real-time vessel tracking (AIS integration)",
      "Geopolitical alert system for route disruptions",
      "Freightos-style guided booking flow",
      "Scale to 50+ port pairs globally",
      "Carrier API partnerships (Maersk, MSC developer programs)",
    ],
  },
];

const statusColors = {
  complete: "bg-emerald-500",
  "in-progress": "bg-blue-500",
  planned: "bg-amber-500",
  future: "bg-gray-500",
};

const statusLabels = {
  complete: "Complete",
  "in-progress": "In Progress",
  planned: "Planned",
  future: "Post-Funding",
};

export default function JVAgreementPage() {
  const [signatures, setSignatures] = useState({
    julian: { signed: false, date: "" },
    blake: { signed: false, date: "" },
  });

  const handleSign = (party: "julian" | "blake") => {
    setSignatures((prev) => ({
      ...prev,
      [party]: {
        signed: !prev[party].signed,
        date: !prev[party].signed
          ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : "",
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-gray-100">
      <div className="border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-lg">SS</div>
            <div>
              <h1 className="text-lg font-semibold">Shipping Savior</h1>
              <p className="text-xs text-gray-400">Joint Venture Agreement</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">Effective Date: April 7, 2026</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Joint Venture Agreement</h1>
          <p className="text-xl text-gray-300">Shipping Savior — AI-Powered Global Trade Intelligence Platform</p>
          <p className="text-gray-400 max-w-2xl mx-auto">This agreement establishes the terms of the joint venture between the undersigned parties for the development, launch, and operation of the Shipping Savior platform.</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">1. Parties</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl font-bold">JB</div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-400">Julian Bradley</h3>
                  <p className="text-sm text-gray-400">CEO, AI Acrobatics</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">Technology partner responsible for platform engineering, AI/ML development, DevOps, and go-to-market execution.</p>
              <div className="text-xs text-gray-500">Email: julian@aiacrobatics.com</div>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">BH</div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400">Blake Harwell</h3>
                  <p className="text-sm text-gray-400">Co-Founder & Industry Expert</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">Domain expert with 10 years in cold chain logistics, carrier relationships (Maersk, MSC, CMA CGM), and investor connections.</p>
              <div className="text-xs text-gray-500">Industry: Cold Chain Supply Chain</div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">2. Roles & Responsibilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-lg font-semibold text-blue-400">Julian Bradley / AI Acrobatics</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Technology & Engineering</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Full-stack platform development (Next.js, PostgreSQL, Drizzle ORM)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>AI/ML integration (Claude API, tool-use chatbot, data intelligence)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>DevOps, cloud infrastructure, CI/CD (Vercel, Neon PostgreSQL)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Data pipeline engineering (carrier schedule aggregation, HTS/port data)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Marketing & Growth</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Website, landing pages, and digital marketing</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>SEO, content strategy, and brand positioning</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Investor presentation materials and demo preparation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Decision Authority</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Day-to-day technical architecture and implementation</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Technology vendor and infrastructure selection</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#9656;</span>Product feature prioritization (in consultation with Blake)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-lg font-semibold text-emerald-400">Blake Harwell</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Industry & Domain Expertise</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Cold chain logistics domain knowledge and product direction</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Carrier relationship management (Maersk, MSC, CMA CGM, ONE, Hapag-Lloyd)</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Data validation — verifying carrier schedules, tariff data, and FTZ information</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>User research and feature requirements from real-world workflows</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Sales & Business Development</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Investor relations and fundraising (Larry connection, pitch preparation)</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Enterprise sales and customer acquisition in cold chain vertical</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Industry partnerships and carrier API access negotiations</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Market feedback loop — bringing real shipper pain points to product</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Decision Authority</h4>
                  <ul className="space-y-1.5 text-sm text-gray-400">
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Day-to-day business development and sales strategy</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Carrier and industry partnership decisions</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#9656;</span>Customer pricing and market positioning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-3">
            <h3 className="text-lg font-semibold text-amber-400">Joint Decision Requirements</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Financial decisions exceeding $5,000</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Investor term negotiations and equity changes</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Hiring or contracting decisions</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Major pivot in product direction or target market</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Legal agreements, IP licensing, or partnerships</li>
              <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">&#9679;</span>Public communications, press, or investor materials</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">3. Equity & Ownership</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Pre-Investment (Current)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">50%</div>
                    <div className="text-sm text-gray-400">Julian Bradley</div>
                  </div>
                  <div className="flex-1 bg-emerald-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">50%</div>
                    <div className="text-sm text-gray-400">Blake Harwell</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Post-Investment (Target)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-blue-500/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400/80">~33%</div>
                    <div className="text-xs text-gray-500">Julian</div>
                  </div>
                  <div className="flex-1 bg-emerald-500/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400/80">~33%</div>
                    <div className="text-xs text-gray-500">Blake</div>
                  </div>
                  <div className="flex-1 bg-orange-500/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400/80">~33%</div>
                    <div className="text-xs text-gray-500">Investor</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Final split subject to investment terms negotiated jointly</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-white/[0.03] border border-white/5">
              <h4 className="text-sm font-medium text-gray-300 mb-2">IP Ownership</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>&#8226; Platform IP is jointly owned by the venture</li>
                <li>&#8226; Each party retains rights to their pre-existing IP</li>
                <li>&#8226; AI Acrobatics retains rights to underlying AI/ML frameworks used across other clients</li>
                <li>&#8226; All venture-specific IP transfers to any future incorporated entity</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">4. Development Budget & Cost Splitting</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="text-sm text-gray-400 mb-1">Estimated Development Cost to Investor-Demo Ready</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">$7,500</div>
              <div className="text-sm text-gray-400 mt-2">Milestones 1-4 &#183; April - May 2026</div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Cost by Milestone</h4>
                <div className="space-y-2">
                  {milestones.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                      <span className="text-sm text-gray-300">{m.id}: {m.title}</span>
                      <span className="text-sm font-semibold text-white">{m.cost}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-sm font-semibold text-blue-400">Total</span>
                    <span className="text-sm font-bold text-blue-400">$7,500</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Cost Responsibility</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="p-3 rounded-lg bg-white/[0.03]"><span className="text-blue-400 font-medium">Technology costs</span> (hosting, APIs, AI services) — AI Acrobatics bears initially, tracked for reimbursement post-funding</div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><span className="text-emerald-400 font-medium">Sales & BD costs</span> (travel, networking, client meetings) — Blake bears</div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><span className="text-amber-400 font-medium">Shared costs</span> (legal, marketing materials, investor deck) — Split 50/50</div>
                  <div className="p-3 rounded-lg bg-white/[0.03]"><span className="text-purple-400 font-medium">Development labor</span> — Contributed as sweat equity by Julian / AI Acrobatics, valued at $7,500</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">All costs documented and available for investor due diligence. Post-investment, operational costs funded from investment capital.</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">5. Milestone-Based Deliverables</h2>
          <p className="text-gray-400 text-sm">All milestones targeted toward the <span className="text-amber-400 font-semibold">May 11, 2026 investor pitch</span> at the Las Vegas golf tournament.</p>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white/20">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                        <p className="text-sm text-gray-400">{milestone.target}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-300">{milestone.cost}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[milestone.status]}`}>{statusLabels[milestone.status]}</span>
                    </div>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {milestone.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className={`mt-1 w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0 ${milestone.status === "complete" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-600"}`}>{milestone.status === "complete" ? "\u2713" : "\u25CB"}</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-1 bg-white/5">
                  <div className={`h-full transition-all duration-500 ${milestone.status === "complete" ? "w-full bg-emerald-500" : milestone.status === "in-progress" ? "w-1/2 bg-blue-500" : "w-0"}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">6. Working Relationship & Communication</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Communication Cadence</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span><span><strong className="text-gray-300">Weekly sync calls</strong> via Zoom — progress review, blocker resolution, priority alignment</span></li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span><span><strong className="text-gray-300">Telegram group</strong> with dedicated topics for async communication</span></li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span><span><strong className="text-gray-300">Text messaging</strong> for urgent items and quick decisions</span></li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span><span><strong className="text-gray-300">Platform changelog</strong> updated after every development session</span></li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">How We Work Together</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span>Blake provides domain requirements and user stories from real-world workflows</li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span>Julian translates requirements into technical specs and builds</li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span>Blake validates features against industry reality</li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span>Joint demo prep sessions leading up to May 11 investor pitch</li>
                <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5">&#9656;</span>Transparent cost tracking shared monthly</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">7. Confidentiality & Exit Terms</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Confidentiality</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>&#8226; Both parties bound by mutual NDA for all venture information</li>
                <li>&#8226; Investor discussions and terms coordinated jointly</li>
                <li>&#8226; Proprietary data treated as confidential venture assets</li>
                <li>&#8226; Trade secrets shared within venture only</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Exit & Dissolution</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>&#8226; Right of first refusal on any equity sale</li>
                <li>&#8226; 90-day written notice period for withdrawal</li>
                <li>&#8226; IP reverts to joint ownership or negotiated buyout</li>
                <li>&#8226; Outstanding costs settled within 60 days</li>
                <li>&#8226; Non-compete: 12 months in competing logistics SaaS</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">8. Terms &amp; Conditions</h2>
          <p className="text-sm text-gray-400">The following standard terms apply to this Joint Venture Agreement and govern the relationship between the parties.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.1 Governing Law &amp; Jurisdiction</h3>
              <p className="text-sm text-gray-400">This Agreement is governed by the laws of the State of California, without regard to conflict-of-laws principles. Any disputes not resolved through the process in Section 8.2 will be brought in the state or federal courts located in San Diego County, California.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.2 Dispute Resolution</h3>
              <p className="text-sm text-gray-400">The parties agree to first attempt in good-faith resolution of any dispute through direct discussion for at least 30 days. Unresolved disputes will then proceed to non-binding mediation before any litigation. Each party bears its own costs unless otherwise ordered.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.3 Entire Agreement</h3>
              <p className="text-sm text-gray-400">This Agreement, together with any signed amendments, constitutes the entire understanding between the parties regarding the Shipping Savior venture and supersedes all prior discussions, proposals, and communications, written or oral.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.4 Amendments</h3>
              <p className="text-sm text-gray-400">Any modification to this Agreement must be in writing and signed (including electronic signature) by both parties. Informal messages, emails, or verbal statements do not modify the Agreement unless confirmed in a signed amendment.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.5 Assignment</h3>
              <p className="text-sm text-gray-400">Neither party may assign or transfer its rights or obligations under this Agreement without the prior written consent of the other party, except that either party may assign to a successor entity formed for the purpose of incorporating the venture.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.6 Severability</h3>
              <p className="text-sm text-gray-400">If any provision of this Agreement is found invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid provision will be replaced with an enforceable provision that most closely reflects the parties&apos; original intent.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.7 Warranties &amp; Disclaimers</h3>
              <p className="text-sm text-gray-400">Each party represents that it has the authority to enter into this Agreement and that its contributions do not infringe on any third-party rights. Except as expressly stated, all work product is provided &quot;as is&quot; without any other warranty, express or implied.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.8 Limitation of Liability</h3>
              <p className="text-sm text-gray-400">Neither party will be liable to the other for indirect, incidental, consequential, special, or punitive damages arising from or related to this Agreement. Each party&apos;s aggregate liability is limited to the amount of documented contributions made to the venture to date.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.9 Indemnification</h3>
              <p className="text-sm text-gray-400">Each party will indemnify, defend, and hold harmless the other from any third-party claims arising from (a) that party&apos;s gross negligence or willful misconduct, or (b) a material breach of its representations or obligations under this Agreement.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.10 Force Majeure</h3>
              <p className="text-sm text-gray-400">Neither party is liable for delay or failure to perform caused by events beyond reasonable control, including acts of God, war, terrorism, pandemics, government action, or infrastructure outages, provided the affected party notifies the other promptly and resumes performance when able.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.11 Notices</h3>
              <p className="text-sm text-gray-400">Formal notices must be sent in writing to the other party&apos;s primary email address listed in Section 1. Notices are effective on delivery. The parties agree that email is an acceptable method of notice for all matters under this Agreement.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">8.12 Counterparts &amp; Electronic Signatures</h3>
              <p className="text-sm text-gray-400">This Agreement may be executed in counterparts, including by electronic signature or &quot;click-to-sign&quot; as implemented in Section 9. Each signed counterpart is an original, and together they constitute one and the same instrument.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3 md:col-span-2">
              <h3 className="text-sm font-semibold text-white">8.13 Relationship of the Parties</h3>
              <p className="text-sm text-gray-400">This Agreement establishes a joint venture between independent parties. Nothing in this Agreement creates an employer/employee, agency, or franchise relationship. Neither party has authority to bind the other beyond the Joint Decision Requirements in Section 2 unless expressly authorized in writing.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3 md:col-span-2">
              <h3 className="text-sm font-semibold text-white">8.14 Survival</h3>
              <p className="text-sm text-gray-400">The following sections survive termination or dissolution of this Agreement: Section 3 (IP Ownership), Section 7 (Confidentiality &amp; Exit), and Sections 8.1, 8.2, 8.7, 8.8, 8.9, and 8.11 of these Terms &amp; Conditions.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-3">9. Signatures</h2>
          <p className="text-sm text-gray-400">By clicking below, each party acknowledges and agrees to the terms outlined in this Joint Venture Agreement.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`rounded-xl border p-6 space-y-4 transition-all duration-300 ${signatures.julian.signed ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Julian Bradley</h3>
                {signatures.julian.signed && <span className="text-xs text-blue-400">{signatures.julian.date}</span>}
              </div>
              <div className="h-20 border-b border-dashed border-white/20 flex items-end pb-2">
                {signatures.julian.signed && <span className="text-2xl italic text-blue-400 font-serif">Julian Bradley</span>}
              </div>
              <button onClick={() => handleSign("julian")} className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${signatures.julian.signed ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                {signatures.julian.signed ? "\u2713 Signed" : "Click to Sign"}
              </button>
            </div>
            <div className={`rounded-xl border p-6 space-y-4 transition-all duration-300 ${signatures.blake.signed ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Blake Harwell</h3>
                {signatures.blake.signed && <span className="text-xs text-emerald-400">{signatures.blake.date}</span>}
              </div>
              <div className="h-20 border-b border-dashed border-white/20 flex items-end pb-2">
                {signatures.blake.signed && <span className="text-2xl italic text-emerald-400 font-serif">Blake Harwell</span>}
              </div>
              <button onClick={() => handleSign("blake")} className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${signatures.blake.signed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                {signatures.blake.signed ? "\u2713 Signed" : "Click to Sign"}
              </button>
            </div>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 pt-8 border-t border-white/5 space-y-2">
          <p>This agreement is a statement of mutual intent. Both parties agree to formalize into a legal operating agreement upon incorporation or investment.</p>
          <p>Shipping Savior — AI-Powered Global Trade Intelligence Platform</p>
          <p className="text-gray-600">Powered by AI Acrobatics &#183; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
