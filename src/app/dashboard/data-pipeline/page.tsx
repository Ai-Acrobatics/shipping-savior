import dynamic from "next/dynamic";

const DataPipelinePage = dynamic(
  () => import("./DataPipelineClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-navy-400">Loading data pipeline health...</div>
      </div>
    ),
  }
);

export default function Page() {
  return <DataPipelinePage />;
}
