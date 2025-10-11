`use strict`;

import { useState, useRef, useEffect } from "react";
import { WorkflowEditor } from "../workflow/workflowEditor";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export default function WorkflowContent() {
  const { BrunnerMessageBox, openModal } = useModal();

  return (
    <>
      <BrunnerMessageBox />
      <div className="flex flex-col h-full">
        <WorkflowEditor openModal={openModal} />
      </div>
    </>
  );
}
