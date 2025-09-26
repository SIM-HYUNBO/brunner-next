import * as React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import "reactflow/dist/base.css";
import "reactflow/dist/style.css";
import { nanoid } from "nanoid";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as workflowEngine from "@/components/workflow/workflowEngine";
import { NodePropertyEditor } from "@/components/workflow/nodePropertyEditor";
import * as actionRegistry from "@/components/workflow/actionRegistry";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import {
  JsonDatasetManager,
  type JsonObject,
} from "@/components/workflow/jsonDatasetManager";

import type {
  ActionNodeData,
  ConditionEdgeData,
} from "@/components/workflow/actionRegistry";

interface WorkflowEditorProps {
  initialNodes?: Node<ActionNodeData>[];
  initialEdges?: Edge<ConditionEdgeData>[];
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  initialNodes = [
    {
      id: constants.workflowActions.START,
      type: "default",
      position: { x: 100, y: 100 },
      data: {
        label: constants.workflowActions.START,
        actionName: constants.workflowActions.START,
        status: constants.workflowNodeStatus.idle,
        inputs: actionRegistry.getDefaultInputs(
          constants.workflowActions.START
        ),
        outputs: actionRegistry.getDefaultOutputs(
          constants.workflowActions.START
        ),
      },
    },
    {
      id: constants.workflowActions.END,
      type: "default",
      position: { x: 100, y: 500 },
      data: {
        label: constants.workflowActions.END,
        actionName: constants.workflowActions.END,
        status: constants.workflowNodeStatus.idle,
        inputs: actionRegistry.getDefaultInputs(constants.workflowActions.END),
        outputs: actionRegistry.getDefaultOutputs(
          constants.workflowActions.END
        ),
      },
    },
  ],
  initialEdges = [],
}) => {
  const stepCounterRef = useRef(0);
  const { BrunnerMessageBox, openModal } = useModal();
  const tableManager = useRef(new JsonDatasetManager()).current;

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [workflowDescription, setWorkflowDescription] = useState("설명 없음");

  const [workflowInputData, setWorkflowInputData] = useState<string>(
    JSON.stringify({ INPUT_TABLE: [{ key1: "test", key2: 123 }] }, null, 2)
  );
  const [workflowOutputData, setWorkflowOutputData] = useState<string>(
    JSON.stringify({ OUTPUT_TABLE: [{ key1: "test", key2: 123 }] }, null, 2)
  );

  const [nodes, setNodes] = useState<Node<ActionNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<ConditionEdgeData>[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(
    null
  );
  const [runningNodeIds, setRunningNodeIds] = useState<string[]>([]);

  const [isInputDataEditorOpen, setIsInputDataEditorOpen] = useState(false);
  const [isInputSchemaEditorOpen, setIsInputSchemaEditorOpen] = useState(false);
  const [isOutputSchemaEditorOpen, setIsOutputSchemaEditorOpen] =
    useState(false);

  useEffect(() => {
    setWorkflowId(nanoid());
  }, []);

  const workflowInputDataObj = useMemo(() => {
    try {
      const parsed = JSON.parse(workflowInputData);
      return Object.keys(parsed).length ? parsed : { table1: [] };
    } catch {
      return { table1: [] };
    }
  }, [workflowInputData]);

  const workflowOutputDataObj = useMemo(() => {
    try {
      const parsed = JSON.parse(workflowOutputData);
      return Object.keys(parsed).length ? parsed : { table1: [] };
    } catch {
      return { table1: [] };
    }
  }, [workflowOutputData]);

  const generateStepId = useCallback(() => {
    stepCounterRef.current += 1;
    return stepCounterRef.current.toString();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((connection: Connection) => {
    const id = generateStepId();
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          id,
          data: { condition: "" },
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#ccc", strokeWidth: 2 },
        } as Edge<ConditionEdgeData>,
        eds
      )
    );
  }, []);

  const onNodeClick = useCallback(
    (_event: any, node: Node<ActionNodeData>) => setSelectedNode(node),
    []
  );

  const addNode = () => {
    const id = generateStepId();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
        data: {
          label: `Node ${id}`,
          actionName: constants.workflowActions.SLEEP,
          status: constants.workflowNodeStatus.idle,
          inputs: actionRegistry.getDefaultInputs(
            constants.workflowActions.SLEEP
          ),
          outputs: actionRegistry.getDefaultOutputs(
            constants.workflowActions.SLEEP
          ),
        },
      },
    ]);
  };

  const getWorkflowJson = (): string =>
    JSON.stringify(
      { workflowId, workflowName, workflowDescription, nodes, edges },
      null,
      2
    );

  return (
    <>
      <BrunnerMessageBox />
      <ReactFlowProvider>
        <div className="flex flex-col">
          <div className="flex flex-row w-full">
            <div className="flex flex-1">
              <ReactFlow
                nodes={
                  nodes.map((n) => ({
                    ...n,
                    style: {
                      background: runningNodeIds.includes(n.id)
                        ? "#FFD700"
                        : n.data.actionName ===
                            constants.workflowActions.START ||
                          n.data.actionName === constants.workflowActions.END
                        ? "#ADFF2F"
                        : "#fff",
                      border: "1px solid #222",
                      color: "#000",
                    },
                  })) as Node<ActionNodeData>[]
                }
                edges={
                  edges.map((e) => ({
                    ...e,
                    markerEnd: { type: "arrowclosed" },
                    style: { stroke: "#ccc", strokeWidth: 2 },
                  })) as Edge<any>[]
                }
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                fitView
                snapToGrid
                snapGrid={[20, 20]}
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>

            <div className="flex flex-col justify-between h-full ml-4">
              <h3>Editor</h3>
              <button className="w-full border mb-2" onClick={addNode}>
                Add Node
              </button>
              <button
                className="w-full border mb-2"
                onClick={() => console.log(getWorkflowJson())}
              >
                Export JSON
              </button>

              <NodePropertyEditor
                workflowId={workflowId}
                workflowName={workflowName}
                workflowDescription={workflowDescription}
                node={selectedNode}
                nodes={nodes}
                onWorkflowUpdate={({ workflowName, workflowDescription }) => {
                  if (workflowName !== undefined) setWorkflowName(workflowName);
                  if (workflowDescription !== undefined)
                    setWorkflowDescription(workflowDescription);
                }}
                onNodeUpdate={(id, updates) => {
                  setNodes((nds) => {
                    const newNodes = nds.map((n) =>
                      n.id === id
                        ? { ...n, data: { ...n.data, ...updates } }
                        : n
                    );
                    setSelectedNode(newNodes.find((n) => n.id === id) || null);
                    return newNodes;
                  });
                }}
              />
            </div>
          </div>

          <div className="flex flex-row mt-5">
            {/* Input Table */}
            <div className="flex flex-col mr-2 w-[calc(50%-10px)]">
              <h4>Input Data</h4>
              <div className="flex mb-2 space-x-2">
                <button
                  className="border bg-green-200 px-3 py-1"
                  onClick={() => setIsInputSchemaEditorOpen(true)}
                >
                  Edit Schema
                </button>
                <button
                  className="border bg-blue-200 px-3 py-1"
                  onClick={() => setIsInputDataEditorOpen(true)}
                >
                  Edit Data
                </button>
              </div>

              {isInputSchemaEditorOpen && (
                <JsonDatasetEditorModal
                  open={isInputSchemaEditorOpen}
                  mode="schema"
                  value={workflowInputDataObj}
                  onConfirm={(newSchema) => {
                    setWorkflowInputData(JSON.stringify(newSchema, null, 2));
                    setIsInputSchemaEditorOpen(false);
                  }}
                  onCancel={() => setIsInputSchemaEditorOpen(false)}
                />
              )}

              {isInputDataEditorOpen && (
                <JsonDatasetEditorModal
                  open={isInputDataEditorOpen}
                  mode="data"
                  value={workflowInputDataObj}
                  onConfirm={(newData) => {
                    setWorkflowInputData(JSON.stringify(newData, null, 2));
                    setIsInputDataEditorOpen(false);
                  }}
                  onCancel={() => setIsInputDataEditorOpen(false)}
                />
              )}

              <textarea
                className="w-full h-[250px] mt-2 border p-2 font-mono text-sm"
                value={workflowInputData}
                readOnly
              />
            </div>

            {/* Output Table */}
            <div className="flex flex-col ml-2 w-[calc(50%-10px)]">
              <h4>Output Data</h4>

              {/* 기존 Edit Schema 버튼 유지 */}
              <div className="flex mb-2">
                <button
                  className="border bg-green-200 px-3 py-1"
                  onClick={() => setIsOutputSchemaEditorOpen(true)}
                >
                  Edit Schema
                </button>
              </div>

              {isOutputSchemaEditorOpen && (
                <JsonDatasetEditorModal
                  open={isOutputSchemaEditorOpen}
                  mode="schema"
                  value={workflowOutputDataObj}
                  onConfirm={(newSchema) => {
                    setWorkflowOutputData(JSON.stringify(newSchema, null, 2));
                    setIsOutputSchemaEditorOpen(false);
                  }}
                  onCancel={() => setIsOutputSchemaEditorOpen(false)}
                />
              )}

              <textarea
                className="w-full h-[250px] mt-2 border p-2 font-mono text-sm"
                value={workflowOutputData}
                readOnly
              />
            </div>
          </div>
        </div>
      </ReactFlowProvider>
    </>
  );
};
