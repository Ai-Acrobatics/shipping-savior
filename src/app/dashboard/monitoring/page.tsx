import dynamic from "next/dynamic";

const MonitoringPage = dynamic(
  () => import("./MonitoringClient"),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-navy-400">Loading monitoring dashboard...</div></div> }
);

export default function Page() {
  return <MonitoringPage />;
}
