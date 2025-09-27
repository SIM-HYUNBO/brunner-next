import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import type { NodeDataTable } from "@/components/workflow/actionRegistry";
import * as actionRegistry from "@/components/workflow/actionRegistry";
import * as constants from "@/components/core/constants";

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

interface WorkflowVariable {
  nodeId: string;
  key: string;
  type: string;
  value?: any;
}

export function collectAllWorkflowVariables(
  nodes: Node<any>[]
): WorkflowVariable[] {
  const variables: WorkflowVariable[] = [];

  nodes.forEach((node) => {
    const outputs: NodeDataTable[] = node.data.outputs ?? [];

    outputs.forEach((output) => {
      variables.push({
        nodeId: node.id,
        key: output.table,
        type: "dataset",
        value: output.value,
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
    node?.data.inputs ?? []
  );
  const [outputs, setOutputs] = useState<NodeDataTable[]>(
    node?.data.outputs ?? []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevActionName = useRef<string>("");
  const [editingOutputs, setEditingOutputs] = useState(false);
  const toggleEditingOutputs = () =>
    setEditingOutputs((prev: boolean) => !prev);

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
      !node.data.design.inputs ||
      node.data.design.inputs.length === 0
    ) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
    } else {
      setInputs(node.data.design.inputs);
      setOutputs(node.data.design.outputs);
    }
  }, [node?.id, node?.data.actionName]);

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

  const allWorkflowVariables = collectAllWorkflowVariables(nodes);

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
        <div className="flex flex-row justify-between">
          <button
            className="px-3 py-1 mt-2 semi-text-bg-color rounded border"
            onClick={() => setIsModalOpen(true)}
          >
            Inputs
          </button>
          <button
            className="px-3 py-1 mt-2 ml-1 semi-text-bg-color rounded border"
            onClick={() => toggleEditingOutputs()}
          >
            Outputs
          </button>
          <button
            className="mt-2 ml-1 px-3 py-1 semi-text-bg-color rounded border"
            onClick={() => {
              if (!node) return;
              let newInputs = inputs;
              let newOutputs = outputs;
              if (prevActionName.current != actionName) {
                newInputs = actionRegistry.getDefaultInputs(actionName);
                newOutputs = actionRegistry.getDefaultOutputs(actionName);
                node.data.design.inputs = newInputs;
                node.data.design.outputs = newOutputs;
                prevActionName.current = actionName;
              }

              onNodeUpdate?.(node.id, {
                actionName,
                inputs: newInputs,
                outputs: newOutputs,
              });

              setActionName(actionName);
              setInputs(newInputs);
              setOutputs(newOutputs);
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
