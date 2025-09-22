import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import type { NodeInputField } from "@/components/workflow/workflowEditor";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  onUpdate: (id: string, updates: any) => void;
  actions: string[];
  workflowId: string;
  workflowName: string;
  workflowDescription: string;
  onWorkflowUpdate?: (updates: {
    workflowId?: string;
    workflowName?: string;
    workflowDescription?: string;
  }) => void;
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  onUpdate,
  actions,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
}) => {
  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [inputs, setInputs] = useState<NodeInputField[]>(
    node?.data.inputs ?? []
  );
  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  // 노드 변경 시 초기값 갱신
  useEffect(() => {
    if (!node) return;
    setActionName(node.data.actionName);
    setInputs(node.data.inputs ?? []);
  }, [node]);

  // 액션 변경 시 기본 입력값 적용 (선택적)
  useEffect(() => {
    if (!actionName || !node) return;

    const defaults = actionRegistry.getDefaultInputs?.(actionName) ?? [];
    setInputs(defaults); // 이전값 상관없이 덮어쓰기
  }, [actionName, node]);

  if (!node)
    return (
      <div style={{ padding: 10 }}>
        <h3>Workflow Info</h3>
        <div>ID: {workflowId}</div>
        <div>
          이름:
          <input
            className="w-full"
            value={wfName}
            onChange={(e) => setWfName(e.target.value)}
            onBlur={() => onWorkflowUpdate?.({ workflowName: wfName })}
          />
        </div>
        <div>
          설명:
          <textarea
            className="w-full"
            value={wfDesc}
            rows={3}
            onChange={(e) => setWfDesc(e.target.value)}
            onBlur={() => onWorkflowUpdate?.({ workflowDescription: wfDesc })}
          />
        </div>
        <div style={{ marginTop: 10, fontStyle: "italic" }}>
          Select a node to edit its properties.
        </div>
      </div>
    );

  const updateInput = (
    index: number,
    key: keyof NodeInputField,
    value: any
  ) => {
    setInputs((prev) =>
      prev.map((input, i) => (i === index ? { ...input, [key]: value } : input))
    );
  };

  return (
    <div style={{ padding: 10 }}>
      <h3>Node Editor</h3>
      <label>Action Name</label>
      <select
        className="w-full"
        value={actionName}
        onChange={(e) => setActionName(e.target.value)}
      >
        {actions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <h4 className="mt-3">Inputs</h4>
      {inputs.map((input, idx) => (
        <div
          key={idx}
          className="border p-2 my-1 rounded bg-gray-50 flex flex-col gap-1"
        >
          <input
            className="border px-2 py-1"
            placeholder="Key"
            value={input.key}
            onChange={(e) => updateInput(idx, "key", e.target.value)}
          />
          <select
            value={input.type}
            onChange={(e) =>
              updateInput(idx, "type", e.target.value as NodeInputField["type"])
            }
          >
            <option value="direct">Direct</option>
            <option value="ref">Reference</option>
          </select>
          {input.type === "direct" ? (
            <input
              className="border px-2 py-1"
              placeholder="Value"
              value={input.value ?? ""}
              onChange={(e) => updateInput(idx, "value", e.target.value)}
            />
          ) : (
            <input
              className="border px-2 py-1"
              placeholder="Source Node ID"
              value={input.sourceNodeId ?? ""}
              onChange={(e) => updateInput(idx, "sourceNodeId", e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        className="mt-2 border px-3 py-1 bg-blue-200"
        onClick={() =>
          setInputs((prev) => [...prev, { key: "", type: "direct", value: "" }])
        }
      >
        + Add Input
      </button>

      <button
        onClick={() => {
          onUpdate(node.id, { actionName, inputs }); // params가 아닌 inputs 업데이트
        }}
      >
        Apply
      </button>
    </div>
  );
};
