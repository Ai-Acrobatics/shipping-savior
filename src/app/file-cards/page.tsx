"use client";

import { FileCard } from "@/components/ui/file-card-collections";

const formats = [
  "txt",
  "doc",
  "pdf",
  "md",
  "mdx",
  "xls",
  "csv",
  "zip",
  "tar",
  "ppt",
  "pptx",
  "json",
  "css",
  "code",
  "png",
  "jpg",
  "img",
  "video",
] as const;

export default function FileCardsDemoPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="flex max-w-xl flex-wrap justify-center gap-6 px-6">
        {formats.map((format) => (
          <FileCard key={format} formatFile={format} />
        ))}
      </div>
    </div>
  );
}
