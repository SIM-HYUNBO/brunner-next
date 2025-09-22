// NodePropertyEditor.tsx
import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  onUpdate: (id: string, updates: any) => void;
  actions: string[]; // 등록된 액션 리스트

  // 🔹 새로 추가된 props
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
  const [params, setParams] = useState(
    JSON.stringify(node?.data.params || {}, null, 2)
  );

  // 워크플로우 정보 로컬 상태 (수정 가능하게)
  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  // 노드 선택 시 초기값 설정
  useEffect(() => {
    if (node) {
      setActionName(node.data.actionName);
      setParams(JSON.stringify(node.data.params || {}, null, 2));
    }
  }, [node]);

  // 액션 변경 시 기본 params 자동 적용
  useEffect(() => {
    if (!actionName) return;
    const defaultParams = actionRegistry.getDefaultParams(actionName) || {};
    setParams(JSON.stringify(defaultParams, null, 2));
  }, [actionName]);

  if (!node)
    return (
      <div style={{ padding: 10 }}>
        <h3>Workflow Info.</h3>
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
        <div style={{ marginTop: 10, fontStyle: "italic" }}>Select a node.</div>
      </div>
    );

  return (
    <div style={{ padding: 10 }}>
      {/* 🔹 워크플로우 정보 영역 */}
      <h3>Workflow Info</h3>
      <div>ID: {workflowId}</div>
      <div>
        Name:
        <input
          className="w-full"
          value={wfName}
          onChange={(e) => setWfName(e.target.value)}
          onBlur={() => onWorkflowUpdate?.({ workflowName: wfName })}
        />
      </div>
      <div>
        Description:
        <textarea
          className="w-full"
          value={wfDesc}
          rows={3}
          onChange={(e) => setWfDesc(e.target.value)}
          onBlur={() => onWorkflowUpdate?.({ workflowDescription: wfDesc })}
        />
      </div>

      {/* 🔹 노드 편집 영역 */}
      <h3 style={{ marginTop: 20 }}>Node Info.</h3>
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

      <label>Params (JSON)</label>
      <textarea
        className="w-full"
        value={params}
        onChange={(e) => setParams(e.target.value)}
        rows={8}
        style={{ width: "100%" }}
      />

      <button
        className="flex w-auto justify-right semi-text-bg-color border border-gray-400 px-5"
        onClick={() => {
          try {
            onUpdate(node.id, {
              actionName,
              params: JSON.parse(params),
            });
          } catch {
            alert("Params가 올바른 JSON 형식이 아닙니다.");
          }
        }}
      >
        Apply
      </button>
    </div>
  );
};
