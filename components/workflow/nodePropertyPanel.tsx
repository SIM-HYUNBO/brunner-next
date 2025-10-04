import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import type {
  NodeDataTable,
  DatasetColumn,
} from "@/components/core/commonData";
import * as commmonFunctions from "@/components/core/commonFunctions";
import * as constants from "@/components/core/constants";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type { JsonColumnType } from "@/components/workflow/jsonDatasetEditorModal";
import { NodePropertyEditor } from "@/components/workflow/nodePropertyEditor";
import { ScriptEditorModal } from "@/components/workflow/scriptEditorModal";
import { useModal } from "@/components/core/client/brunnerMessageBox";

interface NodePropertyPanelProps {
  node: Node<any> | null;
  nodes: Node<any>[];
  scriptContents: string;
  scriptTimeoutMs: number | 5000;
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

export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({
  node,
  nodes,
  scriptContents,
  scriptTimeoutMs,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
  onNodeUpdate,
}) => {
  const [wfName, setWfName] = useState(workflowName);
  const [wfDesc, setWfDesc] = useState(workflowDescription);

  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [inputs, setInputs] = useState<NodeDataTable[]>(
    node?.data.design?.inputs ?? []
  );
  const [outputs, setOutputs] = useState<NodeDataTable[]>(
    node?.data.design?.outputs ?? []
  );

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [localScriptContents, setLocalScript] = useState("");
  const [localScriptTimeoutMs, setLocalTimeoutMs] = useState(5000);

  const prevActionName = useRef<string>("");
  const { BrunnerMessageBox, openModal } = useModal();
  // 🧠 워크플로우 정보 변경 감지
  useEffect(() => {
    setWfName(workflowName);
    setWfDesc(workflowDescription);
  }, [workflowName, workflowDescription]);

  useEffect(() => {
    setLocalScript(scriptContents); // prop 변경 시 동기화
  }, [scriptContents]);

  useEffect(() => {
    setLocalTimeoutMs(scriptTimeoutMs); // prop 변경 시 동기화
  }, [scriptTimeoutMs]);

  // 🧠 노드 변경 시 입력/출력 초기화
  useEffect(() => {
    if (!node || node.data.actionName !== constants.workflowActions.SCRIPT)
      return;

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
  }, [
    node?.id,
    node?.data.actionName,
    node?.data.design?.inputs,
    node?.data.design?.outputs,
  ]);

  const showHelp = () => {
    const apiGuid: string = `
api.log: (...args) => print console log.
api.sleep: (ms) => sleep during miliseconds.
api.alert: (msg) => display alert message.
api.getVar: (path) => get workflow runtime variable value.
api.setVar: (path, value) => set wworkflow runtime variable value.
api.now: () => get current time.
api.timestamp: () => get current time.
api.random: (min, max) => get random number between min to max,
api.clone:(obj) => clone json object,
api.jsonParse: (str) => parse json object.
api.jsonStringify: (obj) => serialize json object.
api.formatDate: (date, fmt) => format date time.
api.postJson: async (url, body) => http post request.
    `;
    openModal(apiGuid);
  };

  // 🧩 유틸: 컬럼 타입 추론
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

  // 🧩 컬럼 타입 정규화
  const normalizeColumnType = (type: string): DatasetColumn["type"] => {
    return ["string", "number", "boolean"].includes(type)
      ? (type as DatasetColumn["type"])
      : "string";
  };

  // 🧩 노드 정보 없을 때 (워크플로우 정보 편집)
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

  // 🧩 실제 렌더링
  return (
    <div style={{ padding: 10 }}>
      <BrunnerMessageBox />
      <div className="">
        {/* Node Property Editor */}
        {node && (
          <div>
            <NodePropertyEditor
              node={node}
              nodes={nodes}
              workflowId={workflowId}
              workflowName={workflowName}
              workflowDescription={workflowDescription}
              onNodeUpdate={(id, updates) => {
                onNodeUpdate?.(id, updates);
              }}
            />
          </div>
        )}
        {/* Apply */}
        <button
          className="px-1 py-1 mt-2 semi-text-bg-color rounded border"
          onClick={() => {
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

            // ✅ 부모로 안전하게 업데이트 전달
            onNodeUpdate?.(node.id, {
              actionName,
              design: { inputs: newInputs, outputs: newOutputs },
            });
          }}
        >
          Apply Node
        </button>
        {node && node.data.actionName === constants.workflowActions.SCRIPT && (
          <div className="flex flex-col mt-5">
            <h3>Script Node Editor</h3>
            <label>Script Preview:</label>
            <textarea
              readOnly
              value={localScriptContents}
              rows={5}
              className="w-full border p-2 font-mono"
            />
            <div className="flex flex-row space-x-1">
              <button
                className="mt-1 px-3 py-1 border rounded semi-text-bg-color"
                onClick={() => setIsScriptModalOpen(true)}
              >
                Edit Script
              </button>
              <label className="mt-2">Timeout (ms):</label>
              <input
                type="number"
                className="border px-2 py-1 w-[100px]"
                value={localScriptTimeoutMs}
                readOnly
              />
            </div>
          </div>
        )}
        {isScriptModalOpen && (
          <ScriptEditorModal
            open={isScriptModalOpen}
            scriptContents={localScriptContents}
            scriptTimeoutMs={localScriptTimeoutMs}
            onConfirm={(newScript, newTimeout) => {
              setLocalScript(newScript);
              setLocalTimeoutMs(newTimeout);
              onNodeUpdate?.(node.id, {
                scriptContents: newScript,
                scriptTimeoutMs: newTimeout,
              });
              setIsScriptModalOpen(false);
            }}
            onCancel={() => setIsScriptModalOpen(false)}
            onHelp={() => showHelp()}
          />
        )}
      </div>

      {/* ✅ Input Modal */}
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

      {/* ✅ Output Modal */}
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
