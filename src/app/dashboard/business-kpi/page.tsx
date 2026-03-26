import dynamic from "next/dynamic";

const BusinessKPIPage = dynamic(
  () => import("./BusinessKPIClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#04081a]">
        <div className="text-navy-400 text-sm">Loading Business KPI Dashboard...</div>
      </div>
    ),
  }
);

export default function Page() {
  return <BusinessKPIPage />;
}
