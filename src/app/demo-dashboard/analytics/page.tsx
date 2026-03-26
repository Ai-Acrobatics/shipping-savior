import dynamic from "next/dynamic";

const AnalyticsPage = dynamic(
  () => import("./AnalyticsClient"),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-navy-400">Loading analytics...</div></div> }
);

export default function Page() {
  return <AnalyticsPage />;
}
