`use strict`;

import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { runWorkflow } from "@component/workflow/workflow";

export default function DesignerButton({ label, workflow, input }) {
  const router = useRouter();
  const [globals, setGlobals] = useState({});

  const context = useMemo(
    () => ({
      router,
      globals,
      setGlobal: (k, v) => setGlobals((g) => ({ ...g, [k]: v })),
      input,
      toast: (m) => alert(m),
    }),
    [router, globals, input]
  );

  const handleClick = async () => {
    try {
      await runWorkflow(workflow, context);
    } catch (err) {
      console.error("Workflow error:", err);
    }
  };

  return <button onClick={handleClick}>{label}</button>;
}
