import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import * as constants from "@/components/core/constants";
import type { NodeDataTable } from "@/components/core/commonData";
import * as commmonFunctions from "@/components/core/commonFunctions";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import { Button } from "antd";

interface NodePropertyEditorProps {
  node: Node<any> | null;
  onNodeUpdate?: (id: string, updates: any) => void;
  openModal?: (message: string) => void;
}

export const NodePropertyEditor: React.FC<NodePropertyEditorProps> = ({
  node,
  onNodeUpdate,
  openModal,
}) => {
  const [isNodeInputModalOpen, setIsNodeInputModalOpen] = useState(false);
  const [isNodeOutputModalOpen, setIsNodeOutputModalOpen] = useState(false);

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

  // 액션 변경 즉시 반영
  const handleActionChange = (newAction: string) => {
    const defaultInputs = commmonFunctions.getDefaultInputs(newAction) ?? [];
    const defaultOutputs = commmonFunctions.getDefaultOutputs(newAction) ?? [];

    let design: any = {
      inputs: [...defaultInputs],
      outputs: [...defaultOutputs],
    };

    if (newAction === constants.workflowActions.SCRIPT) {
      design.scriptContents = "";
      design.scriptTimeoutMs = 5000;
    } else if (newAction === constants.workflowActions.BRANCH) {
      design.mode = constants.workflowBranchNodeMode.Branch;
      design.condition = "";
    } else if (newAction === constants.workflowActions.SQL) {
      design.sqlStmt = "";
      design.dbConnectionId = "";
      design.sqlParams = [];
      design.outputTableName = "";
    } else if (newAction === constants.workflowActions.CALL) {
      design.targetWorkflowId = "";
      design.targetWorkflowName = "";
    }

    onNodeUpdate?.(node.id, {
      actionName: newAction,
      design,
    });

    openModal?.(constants.messages.SUCCESS_APPLIED);
  };

  return (
    <div className="w-full">
      <div>ID: {node.id}</div>
      <div>Label: {node.data.label}</div>
      <div>Status: {node.data.status}</div>

      <div className="flex flex-row mt-2 items-center">
        <label>Action Name:</label>
        <select
          className="flex flex-1 border px-2 py-1 ml-2 mt-1 text-center"
          value={node.data.actionName}
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
        <Button
          className="px-2 py-1 general-text-bg-color border border-black rounded"
          onClick={() => setIsNodeInputModalOpen(true)}
        >
          Node Inputs
        </Button>
        <Button
          className="px-2 py-1 general-text-bg-color border border-black rounded"
          onClick={() => setIsNodeOutputModalOpen(true)}
        >
          Node Outputs
        </Button>
      </div>

      {/* Input Modal */}
      {isNodeInputModalOpen && (
        <JsonDatasetEditorModal
          open={isNodeInputModalOpen}
          title="Input Data"
          mode="data"
          value={node.data.run.inputs}
          onConfirm={(newSchema) => {
            const newInputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setIsNodeInputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: {
                ...node.data.design,
                inputs: newInputsArray,
              },
            });
          }}
          onCancel={() => setIsNodeInputModalOpen(false)}
        />
      )}

      {/* Output Modal */}
      {isNodeOutputModalOpen && (
        <JsonDatasetEditorModal
          open={isNodeOutputModalOpen}
          title="Output Data"
          mode="data"
          value={node.data.run.outputs}
          onConfirm={(newSchema) => {
            const newOutputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));
            setIsNodeOutputModalOpen(false);
            onNodeUpdate?.(node.id, {
              design: {
                ...node.data.design,
                outputs: newOutputsArray,
              },
            });
          }}
          onCancel={() => setIsNodeOutputModalOpen(false)}
        />
      )}
    </div>
  );
};
