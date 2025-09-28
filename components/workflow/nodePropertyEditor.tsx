import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import type {
  NodeDataTable,
  DatasetColumn,
} from "@/components/workflow/actionRegistry";
import * as actionRegistry from "@/components/workflow/actionRegistry";
import * as constants from "@/components/core/constants";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type { JsonColumnType } from "@/components/workflow/jsonDatasetEditorModal";

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

export interface WorkflowVariable {
  nodeId: string;
  table: string; // 테이블 이름
  columns: DatasetColumn[]; // 컬럼 정보
  rows?: Record<string, any>[];
}

export function collectAllWorkflowVariables(
  nodes: Node<any>[]
): WorkflowVariable[] {
  const variables: WorkflowVariable[] = [];

  nodes.forEach((node) => {
    node.data.design.outputs?.forEach((output: NodeDataTable) => {
      variables.push({
        nodeId: node.id,
        table: output.table,
        columns: output.columns,
        rows: output.rows,
      });
    });
  });

  return variables;
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

  const prevActionName = useRef<string>("");

  useEffect(() => {
    setWfName(workflowName);
    setWfDesc(workflowDescription);
  }, [workflowName, workflowDescription]);

  useEffect(() => {
    if (!node) return;

    const action = node.data.actionName;
    setActionName(action);

    const defaultInputs = actionRegistry.getDefaultInputs?.(action) ?? [];
    const defaultOutputs = actionRegistry.getDefaultOutputs?.(action) ?? [];

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

  const normalizeColumnType = (type: string): DatasetColumn["type"] => {
    return ["string", "number", "boolean"].includes(type)
      ? (type as DatasetColumn["type"])
      : "string";
  };

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
          {Object.values(constants.workflowActions).map((actionName) => (
            <option key={actionName} value={actionName}>
              {actionName}
            </option>
          ))}
        </select>

        <div className="flex flex-row justify-between mt-2">
          <button
            className="px-3 py-1 semi-text-bg-color rounded border"
            onClick={() => setIsInputModalOpen(true)}
          >
            Edit Node Inputs
          </button>
          <button
            className="px-3 py-1 semi-text-bg-color rounded border"
            onClick={() => setIsOutputModalOpen(true)}
          >
            Edit Node Outputs
          </button>
          <button
            className="px-3 py-1 semi-text-bg-color rounded border"
            onClick={() => {
              const newInputs =
                prevActionName.current !== actionName
                  ? actionRegistry.getDefaultInputs(actionName)
                  : inputs;
              const newOutputs =
                prevActionName.current !== actionName
                  ? actionRegistry.getDefaultOutputs(actionName)
                  : outputs;

              prevActionName.current = actionName;
              setActionName(actionName);
              setInputs(newInputs);
              setOutputs(newOutputs);
              node.data.design.inputs = newInputs;
              node.data.design.outputs = newOutputs;
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Input Modal */}
      {isInputModalOpen && (
        <JsonDatasetEditorModal
          open={isInputModalOpen}
          mode="schema"
          value={inputs.reduce((acc, table: any) => {
            acc[table.table] = table.columns.map((col: any) => ({
              key: col.key,
              type: col.type as JsonColumnType,
            }));
            return acc;
          }, {} as Record<string, DatasetColumn[]>)}
          onConfirm={(newSchema) => {
            const newInputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => {
              // data가 배열인 경우 첫 번째 요소를 기준으로 스키마 추출
              const firstRow: any =
                Array.isArray(data) && data.length > 0 ? data[0] : {};

              const columns = Object.entries(firstRow).map(([key, value]) => {
                let type: "string" | "number" | "boolean" | "object" = "string";

                if (typeof value === "number") type = "number";
                else if (typeof value === "boolean") type = "boolean";
                else if (typeof value === "object" && value !== null)
                  type = "object";

                return { key, type, value };
              });

              return {
                table,
                columns,
                rows: [Array.isArray(data) ? data : []],
              };
            });

            setInputs(newInputsArray);
            setIsInputModalOpen(false);
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
            ).map(([table, data]) => {
              // data가 배열인 경우 첫 번째 요소를 기준으로 스키마 추출
              const firstRow: any =
                Array.isArray(data) && data.length > 0 ? data[0] : {};

              const columns = Object.entries(firstRow).map(([key, value]) => {
                let type: "string" | "number" | "boolean" | "object" = "string";

                if (typeof value === "number") type = "number";
                else if (typeof value === "boolean") type = "boolean";
                else if (typeof value === "object" && value !== null)
                  type = "object";

                return { key, type, value };
              });

              return {
                table,
                columns,
                rows: Array.isArray(data) ? data : [],
              };
            });

            setOutputs(newOutputsArray);
            setIsOutputModalOpen(false);
          }}
          onCancel={() => setIsOutputModalOpen(false)}
        />
      )}
    </div>
  );
};
