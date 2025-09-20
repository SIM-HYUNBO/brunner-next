// NodePropertyEditor.tsx
import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  onUpdate: (id: string, updates: any) => void;
  actions: string[]; // 등록된 액션 리스트
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  onUpdate,
  actions,
}) => {
  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [params, setParams] = useState(
    JSON.stringify(node?.data.params || {}, null, 2)
  );

  useEffect(() => {
    if (node) {
      setActionName(node.data.actionName);
      setParams(JSON.stringify(node.data.params, null, 2));
    }
  }, [node]);

  if (!node) return <div>노드를 선택하세요</div>;

  return (
    <div style={{ padding: 10 }}>
      <h3>Node 설정</h3>

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
        onClick={() =>
          onUpdate(node.id, {
            actionName,
            params: JSON.parse(params),
          })
        }
      >
        적용
      </button>
    </div>
  );
};
