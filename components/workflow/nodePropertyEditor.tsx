import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import type { NodeInputField } from "@/components/workflow/workflowEditor";
import { InputMappingModal } from "@/components/workflow/inputMappingModal";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  workflowId: string;
  workflowName: string;
  workflowDescription: string;
  onWorkflowUpdate?: (updates: {
    workflowId?: string;
    workflowName?: string;
    workflowDescription?: string;
  }) => void;
  onNodeUpdate?: (id: string, updates: any) => void;
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
  onNodeUpdate,
}) => {
  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [inputs, setInputs] = useState<NodeInputField[]>(
    node?.data.inputs ?? []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 워크플로우 정보 갱신
  useEffect(() => {
    setWfName(workflowName);
    setWfDesc(workflowDescription);
  }, [workflowName, workflowDescription]);

  // 노드 변경 시 초기값 갱신
  useEffect(() => {
    if (!node) return;
    setActionName(node.data.actionName);
    setInputs(node.data.inputs ?? []);
  }, [node]);

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

  return (
    <div style={{ padding: 10 }}>
      <h3>Node Editor</h3>
      <div>ID: {node.id}</div>
      <div>Label: {node.data.label}</div>
      <div>Status: {node.data.status}</div>

      <div className="mt-2">
        <label>Action Name:</label>
        <select
          className="w-full border px-2 py-1 mt-1"
          value={actionName}
          onChange={(e) => setActionName(e.target.value)}
        >
          {Array.from(actionRegistry.actionMap.keys()).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          className="mt-2 px-3 py-1 bg-blue-200 rounded"
          onClick={() => {
            if (!node) return;

            // 부모 노드 업데이트
            onNodeUpdate?.(node.id, { actionName, inputs });

            // 로컬 state는 이미 actionName, inputs를 사용하므로 따로 setState 필요 없음
          }}
        >
          Apply
        </button>
      </div>

      <div className="mt-4">
        <button
          className="px-3 py-1 bg-green-200 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Edit Inputs
        </button>
      </div>

      {/* Input Mapping Modal */}
      <InputMappingModal
        isOpen={isModalOpen}
        actionName={node.data.actionName} // 읽기 전용, 모달에서는 변경 불가
        inputs={inputs}
        onClose={() => setIsModalOpen(false)}
        onSave={(newInputs: NodeInputField[]) => {
          setInputs(newInputs);
          onNodeUpdate?.(node.id, { inputs: newInputs });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
