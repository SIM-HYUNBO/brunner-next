"use client";

import { TabbedWorkflowEditor } from "../workflow/tabbedWorkflowEditor";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export default function WorkflowContent() {
  const { BrunnerMessageBox, openModal } = useModal();

  return (
    <>
      <BrunnerMessageBox />
      <div className="flex flex-col h-full">
        <TabbedWorkflowEditor openModal={openModal} />
      </div>
    </>
  );
}
