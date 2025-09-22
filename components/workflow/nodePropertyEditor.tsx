import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";

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
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
}) => {
  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  // 워크플로우 정보가 바뀌면 상태 갱신
  useEffect(() => {
    setWfName(workflowName);
    setWfDesc(workflowDescription);
  }, [workflowName, workflowDescription]);

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

  // 노드 선택 시 간단 정보만 표시
  return (
    <div style={{ padding: 10 }}>
      <h3>Node Info</h3>
      <div>ID: {node.id}</div>
      <div>Label: {node.data.label}</div>
      <div>Status: {node.data.status}</div>
    </div>
  );
};
