"use client";

import { TabbedWorkflowEditor } from "@/components/workflow/tabbedWorkflowEditor";

export default function WorkflowContent() {
  return (
    <>
      <div className="flex flex-col h-full">
        <TabbedWorkflowEditor />
      </div>
    </>
  );
}
