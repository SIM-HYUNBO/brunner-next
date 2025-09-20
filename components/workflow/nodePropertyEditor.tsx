// NodePropertyEditor.tsx
import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import * as actionRegistry from "@/components/workflow/actionRegistry";

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
        적용
      </button>
    </div>
  );
};
