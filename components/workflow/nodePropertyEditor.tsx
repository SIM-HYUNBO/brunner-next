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
  nodes: Node<any>[];
  workflowId: string | null;
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
  nodes,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
  onNodeUpdate,
}) => {
  const { BrunnerMessageBox, openModal } = useModal();

  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [inputs, setInputs] = useState<NodeDataTable[]>(
    node?.data.design?.inputs ?? []
  );
  const [outputs, setOutputs] = useState<NodeDataTable[]>(
    node?.data.design?.outputs ?? []
  );

  // SCRIPT 노드 전용
  const [scriptContents, setScriptContents] = useState(
    node?.data.design.scriptContents || ""
  );
  const [scriptTimeoutMs, setTimeoutMs] = useState(
    node?.data.design.timeoutMs ?? 5000
  );

  // useRef를 이용해 항상 최신 값을 추적
  const scriptContentsRef = useRef(scriptContents);
  const scriptTimeoutMsRef = useRef(scriptTimeoutMs);

  // 상태가 바뀔 때마다 ref도 업데이트
  useEffect(() => {
    scriptContentsRef.current = scriptContents;
  }, [scriptContents]);

  useEffect(() => {
    scriptTimeoutMsRef.current = scriptTimeoutMs;
  }, [scriptTimeoutMs]);

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  const prevActionName = useRef<string>("");

  // 워크플로우 정보 동기화
  useEffect(() => {
    setWfName(workflowName);
    setWfDesc(workflowDescription);
  }, [workflowName, workflowDescription]);

  // 노드 변경 시 초기화
  useEffect(() => {
    if (!node) return;
    const action = node.data.actionName;
    setActionName(action);

    const defaultInputs = commmonFunctions.getDefaultInputs?.(action) ?? [];
    const defaultOutputs = commmonFunctions.getDefaultOutputs?.(action) ?? [];

    if (prevActionName.current !== action) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
      prevActionName.current = action;
    } else if (
      !node.data.design?.inputs ||
      node.data.design.inputs.length === 0
    ) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
    } else {
      setInputs(node.data.design.inputs);
      setOutputs(node.data.design.outputs);
    }

    // SCRIPT 노드 속성 동기화
    if (action === constants.workflowActions.SCRIPT) {
      setScriptContents(node.data.design.scriptContents || "");
      setTimeoutMs(node.data.design.scriptTimeoutMs ?? 5000);
    }
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
        {/* <h3>Workflow Info</h3>
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
        </div> */}
      </div>
    );
  }

  return (
    <div>
      <BrunnerMessageBox />
      {/* <h3>Node Editor</h3> */}
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
          onClick={() => setIsInputModalOpen(true)}
        >
          Node Inputs
        </button>
        <button
          className="px-1 py-1 semi-text-bg-color rounded border"
          onClick={() => setIsOutputModalOpen(true)}
        >
          Node Outputs
        </button>
        <button
          className="py-1 semi-text-bg-color rounded border"
          onClick={() => {
            // 액션 이름이 바뀌면 기본 입력/출력 가져오기
            const newInputs =
              prevActionName.current !== actionName
                ? commmonFunctions.getDefaultInputs(actionName)
                : inputs;
            const newOutputs =
              prevActionName.current !== actionName
                ? commmonFunctions.getDefaultOutputs(actionName)
                : outputs;

            prevActionName.current = actionName;
            setInputs(newInputs);
            setOutputs(newOutputs);

            // 최신 값 참조
            const newDesign = {
              scriptContents: scriptContentsRef.current,
              scriptTimeoutMs: scriptTimeoutMsRef.current,
              inputs: [...newInputs], // 배열이면 새 객체로 복사
              outputs: [...newOutputs],
            };

            const updates: any = {
              actionName,
              design: newDesign,
            };

            onNodeUpdate?.(node.id, updates);
            openModal(constants.messages.SUCCESS_APPLIED);
          }}
        >
          Apply
        </button>
      </div>

      {/* Input Modal */}
      {isInputModalOpen && (
        <JsonDatasetEditorModal
          open={isInputModalOpen}
          mode="schema"
          value={inputs.reduce((acc, table) => {
            acc[table.table] = table.columns.map((col) => ({
              key: col.key,
              type: col.type as JsonColumnType,
            }));
            return acc;
          }, {} as Record<string, DatasetColumn[]>)}
          onConfirm={(newSchema) => {
            const newInputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setInputs(newInputsArray);
            setIsInputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: { inputs: newInputsArray, outputs },
            });
          }}
          onCancel={() => setIsInputModalOpen(false)}
        />
      )}

      {/* Output Modal */}
      {isOutputModalOpen && (
        <JsonDatasetEditorModal
          open={isOutputModalOpen}
          mode="schema"
          value={outputs.reduce((acc, table) => {
            acc[table.table] = table.columns.map((col) => ({
              key: col.key,
              type: col.type as JsonColumnType,
            }));
            return acc;
          }, {} as Record<string, DatasetColumn[]>)}
          onConfirm={(newSchema) => {
            const newOutputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setOutputs(newOutputsArray);
            setIsOutputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: { inputs, outputs: newOutputsArray },
            });
          }}
          onCancel={() => setIsOutputModalOpen(false)}
        />
      )}
    </div>
  );
};
