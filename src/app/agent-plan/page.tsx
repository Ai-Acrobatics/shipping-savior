"use client";

import Plan from "@/components/ui/agent-plan";

export default function AgentPlanDemoPage() {
  return (
    <div className="flex h-screen flex-col bg-background p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Agent Plan Visualization
        </h1>
        <p className="text-sm text-muted-foreground">
          Hierarchical task + subtask tracker with status transitions, MCP tool
          tags, and dependency links. Click status icons to cycle state; click
          task rows to expand subtasks; click subtask rows to reveal tools and
          description.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <Plan />
      </div>
    </div>
  );
}
