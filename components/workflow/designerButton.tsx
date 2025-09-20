"use strict";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { runWorkflow } from "@/components/workflow/workflowEngine";

interface DesignerButtonProps {
  label: string;
  jWorkflowData: any; // 워크플로우 JSON 구조에 맞게 나중에 구체화 가능
  input?: Record<string, any>;
}

export default function DesignerButton({
  label,
  jWorkflowData,
  input,
}: DesignerButtonProps) {
  const router = useRouter();
  const [globals, setGlobals] = useState<Record<string, any>>({});

  const context = useMemo(
    () => ({
      router,
      globals,
      setGlobal: (k: string, v: any) => setGlobals((g) => ({ ...g, [k]: v })),
      input,
      toast: (m: any) => alert(m),
    }),
    [router, globals, input]
  );

  const handleClick = async () => {
    try {
      await runWorkflow(jWorkflowData, context);
    } catch (err) {
      console.error("Workflow error:", err);
    }
  };

  return <button onClick={handleClick}>{label}</button>;
}
