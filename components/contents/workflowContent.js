`use strict`;

import { useState, useRef, useEffect } from "react";
import { WorkflowEditor } from "../workflow/workflowEditor";

export default function WorkflowContent() {
  return (
    <>
      <WorkflowEditor />
    </>
  );
}
