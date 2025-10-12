import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import * as constants from "@/components/core/constants";
import type {
  NodeDataTable,
  DatasetColumn,
} from "@/components/core/commonData";
import * as commmonFunctions from "@/components/core/commonFunctions";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type { JsonColumnType } from "@/components/workflow/jsonDatasetEditorModal";
import { useModal } from "@/components/core/client/brunnerMessageBox";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  onNodeUpdate?: (id: string, updates: any) => void;
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  onNodeUpdate,
}) => {
  const { BrunnerMessageBox, openModal } = useModal();

  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [NodeInputs, setNodeInputs] = useState({});
  const [NodeOutputs, setNodeOutputs] = useState({});

  // SCRIPT 노드 전용
  const [scriptContents, setScriptContents] = useState(
    node?.data.design.scriptContents || ""
  );
  const [scriptTimeoutMs, setTimeoutMs] = useState(
    node?.data.design.scriptTimeoutMs ?? 5000
  );

  // useRef를 이용해 항상 최신 값을 추적
  const scriptContentsRef = useRef(scriptContents);
  const scriptTimeoutMsRef = useRef(scriptTimeoutMs);

  useEffect(() => {
    scriptContentsRef.current = scriptContents;
  }, [scriptContents]);

  useEffect(() => {
    scriptTimeoutMsRef.current = scriptTimeoutMs;
  }, [scriptTimeoutMs]);

  const [isNodeInputModalOpen, setIsNodeInputModalOpen] = useState(false);
  const [isNodeOutputModalOpen, setIsNodeOutputModalOpen] = useState(false);

  const prevActionName = useRef<string>("");

  // 노드 변경 시 초기화
  useEffect(() => {
    if (!node) return;
    const action = node.data.actionName;
    setActionName(action);

    const defaultInputs = commmonFunctions.getDefaultInputs?.(action) ?? [];
    const defaultOutputs = commmonFunctions.getDefaultOutputs?.(action) ?? [];

    setNodeInputs(node.data.run.inputs);
    setNodeOutputs(node.data.run.outputs);
  }, [node]);

  // 컬럼 타입 추론
  const inferColumns = (data: any) => {
    const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : {};
    return Object.entries(firstRow).map(([key, value]) => {
      let type: "string" | "number" | "boolean" | "object" = "string";
      if (typeof value === "number") type = "number";
      else if (typeof value === "boolean") type = "boolean";
      else if (typeof value === "object" && value !== null) type = "object";
      return { key, type, value };
    });
  };

  if (!node) {
    return (
      <div style={{ padding: 10 }}>
        <div style={{ marginTop: 10, fontStyle: "italic" }}>
          Select a node to edit its properties.
        </div>
      </div>
    );
  }

  // 액션 변경 시 UI + 자동 Apply
  const handleActionChange = (newAction: string) => {
    setActionName(newAction);

    const defaultInputs = commmonFunctions.getDefaultInputs(newAction) ?? [];
    const defaultOutputs = commmonFunctions.getDefaultOutputs(newAction) ?? [];

    // design 초기화
    let design: any = {
      inputs: [...defaultInputs],
      outputs: [...defaultOutputs],
    };

    if (newAction === constants.workflowActions.SCRIPT) {
      design.scriptContents = "";
      design.scriptTimeoutMs = 5000;
    } else if (newAction === constants.workflowActions.BRANCH) {
      design.mode = constants.workflowBranchNodeMode.Branch;
      design.condition = ""; // 조건식 초기화
    } else if (newAction === constants.workflowActions.SQL) {
      design.sqlStmt = "";
      design.dbConnectionId = "";
      design.sqlParams = [];
      // design.maxRows = 0;
      design.outputTableName = "";
    }

    // 노드 업데이트
    onNodeUpdate?.(node.id, {
      actionName: newAction,
      design: design,
    });

    prevActionName.current = newAction;
    openModal(constants.messages.SUCCESS_APPLIED);
  };

  return (
    <div>
      <BrunnerMessageBox />
      <div>ID: {node.id}</div>
      <div>Label: {node.data.label}</div>
      <div>Status: {node.data.status}</div>

      <div className="mt-2">
        <label>Action Name:</label>
        <select
          className="w-full border px-2 py-1 mt-1"
          value={actionName}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          {Object.values(constants.workflowActions).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs/Outputs 버튼 */}
      <div className="flex flex-row mt-2 space-x-1">
        <button
          className="px-1 py-1 semi-text-bg-color rounded border"
          onClick={() => setIsNodeInputModalOpen(true)}
        >
          Node Inputs
        </button>
        <button
          className="px-1 py-1 semi-text-bg-color rounded border"
          onClick={() => setIsNodeOutputModalOpen(true)}
        >
          Node Outputs
        </button>
        <button
          className="py-1 semi-text-bg-color rounded border"
          onClick={() => {
            // Apply 수동 클릭 시도
            const newDesign = {
              scriptContents: scriptContentsRef.current,
              scriptTimeoutMs: scriptTimeoutMsRef.current,
              inputs: NodeInputs,
              outputs: NodeOutputs,
            };
            onNodeUpdate?.(node.id, { actionName, design: newDesign });
            openModal(constants.messages.SUCCESS_APPLIED);
          }}
        >
          Apply
        </button>
      </div>

      {/* Input Modal */}
      {isNodeInputModalOpen && (
        <JsonDatasetEditorModal
          open={isNodeInputModalOpen}
          mode="data"
          value={NodeInputs}
          onConfirm={(newSchema) => {
            const newInputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setNodeInputs(newInputsArray);
            setIsNodeInputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: { inputs: newInputsArray, outputs: NodeOutputs },
            });
          }}
          onCancel={() => setIsNodeInputModalOpen(false)}
        />
      )}

      {/* Output Modal */}
      {isNodeOutputModalOpen && (
        <JsonDatasetEditorModal
          open={isNodeOutputModalOpen}
          mode="data"
          value={NodeOutputs}
          onConfirm={(newSchema) => {
            const newOutputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setNodeOutputs(newOutputsArray);
            setIsNodeOutputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: { inputs: NodeInputs, outputs: newOutputsArray },
            });
          }}
          onCancel={() => setIsNodeOutputModalOpen(false)}
        />
      )}
    </div>
  );
};
