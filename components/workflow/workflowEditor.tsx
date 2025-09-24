import * as React from "react";
import { useState, useCallback, useRef } from "react";
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

import type {
  NodeInputField,
  NodeOutputField,
  ActionNodeData,
  ConditionEdgeData,
} from "@/components/workflow/actionRegistry";

interface WorkflowEditorProps {
  initialNodes?: Node<ActionNodeData>[];
  initialEdges?: Edge<ConditionEdgeData>[];
}

// -------------------- WorkflowEditor --------------------
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
  React.useEffect(() => {
    const initInputValue = `[{ "key1": "test", "key2": 123 }]`;
    setWorkflowInputData(initInputValue);
  }, []);

  const stepCounterRef = useRef(0);
  const { BrunnerMessageBox, openModal } = useModal();

  const [workflowId, setWorkflowId] = useState(nanoid());
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [workflowDescription, setWorkflowDescription] = useState("설명 없음");
  const [workflowInputData, setWorkflowInputData] = useState<string>("");
  const [workflowOutputData, setWorkflowOutputData] = useState([]);
  const [textInputValue, setTextInputValue] = useState(
    JSON.stringify(workflowInputData)
  );

  const [nodes, setNodes] = useState<Node<ActionNodeData>[]>(
    initialNodes as Node<ActionNodeData>[]
  );
  const [edges, setEdges] = useState<Edge<ConditionEdgeData>[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(
    null
  );
  const [selectedEdge, setSelectedEdge] =
    useState<Edge<ConditionEdgeData> | null>(null);
  const [runningNodeIds, setRunningNodeIds] = useState<string[]>([]);

  const generateStepId = useCallback(() => {
    stepCounterRef.current += 1;
    return stepCounterRef.current.toString();
  }, []);

  // -------------------- ReactFlow 핸들러 --------------------
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
  const onEdgeClick = useCallback(
    (_event: any, edge: Edge<ConditionEdgeData>) => setSelectedEdge(edge),
    []
  );

  // -------------------- 노드 / 엣지 조작 --------------------
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

  const updateEdgeCondition = () => {
    if (!selectedEdge) return;
    const cond = prompt("Enter condition:", selectedEdge.data?.condition || "");
    if (cond !== null) {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === selectedEdge.id
            ? { ...e, data: { ...e.data, condition: cond } }
            : e
        )
      );
    }
  };

  const getWorkflowJson = (): string =>
    JSON.stringify(
      { workflowId, workflowName, workflowDescription, nodes, edges },
      null,
      2
    );

  const exportWorkflow = () => {
    const workflowJson = getWorkflowJson();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<pre style="white-space: pre-wrap; word-wrap: break-word;">${workflowJson}</pre>`
      );
      win.document.close();
    }
  };

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // -------------------- 워크플로우 실행 --------------------
  async function executeWorkflow(workflow: any = [], workflowInputs: any = []) {
    const nodesList: Node<any>[] = workflow.nodes;
    const edgesList: Edge<any>[] = workflow.edges;

    const startNode = nodesList.find(
      (n) => n.data.actionName === constants.workflowActions.START
    );
    if (!startNode) {
      openModal(constants.messages.WORKFLOW_STARTNODE_NOT_FOUND);
      return null;
    }

    startNode.data.inputs = workflowInputs;

    const edgeMap: Record<string, Edge<any>[]> = {};
    edgesList.forEach((e) => {
      if (!e.source) return;
      if (!edgeMap[e.source]) edgeMap[e.source] = [];
      edgeMap[e.source]!.push(e);
    });

    const visitedNodes = new Set<string>();
    const context: Record<string, any> = {};

    async function traverse(nodeId: string) {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);

      const node = nodesList.find((n) => n.id === nodeId);
      if (!node) return;

      const stepInputs = node.data.inputs
        ? Object.fromEntries(
            node.data.inputs.map((input: NodeInputField) => {
              if (input.type === "direct") return [input.key, input.value];
              if (input.type === "ref")
                return [input.key, context[input.sourceNodeId!]];
              return [input.key, undefined];
            })
          )
        : {};

      const shouldRun = !node.data.if || Boolean(node.data.if);
      let result: any = null;

      if (shouldRun) {
        setRunningNodeIds((prev) => [...prev, nodeId]);

        switch (node.data.actionName) {
          case constants.workflowActions.MATHOP: {
            const a = Number(
              node.data.inputs.find((i: NodeInputField) => i.key === "a")
                ?.value ?? 0
            );
            const b = Number(
              node.data.inputs.find((i: NodeInputField) => i.key === "b")
                ?.value ?? 0
            );
            const operator = node.data.inputs.find(
              (i: NodeInputField) => i.key === "operator"
            )?.value;
            switch (operator) {
              case "+":
                result = a + b;
                break;
              case "-":
                result = a - b;
                break;
              case "*":
                result = a * b;
                break;
              case "/":
                result = b !== 0 ? a / b : 0;
                break;
              default:
                result = 0;
            }
            context[nodeId] = result;
            break;
          }

          case constants.workflowActions.BRANCH: {
            const condition = node.data.inputs.find(
              (i: any) => i.key === "condition"
            )?.value;
            const outgoing = edgeMap[nodeId] || [];
            if (outgoing.length > 0) {
              const targetEdge = condition ? outgoing[0] : outgoing[1];
              if (targetEdge) await traverse(targetEdge.target);
            }
            break;
          }

          default:
            result = await workflowEngine.runWorkflowStep(node, context);
            context[nodeId] = result;
        }

        setRunningNodeIds((prev) => prev.filter((id) => id !== nodeId));
      }

      if (node.data.actionName !== constants.workflowActions.BRANCH) {
        const outgoingEdges = edgeMap[nodeId] || [];
        for (const edge of outgoingEdges) {
          if (!edge.data?.condition || Boolean(edge.data.condition))
            await traverse(edge.target);
        }
      }

      return result;
    }

    await traverse(startNode.id);
    return context;
  }

  const executeWorkflowFromJson = async () => {
    const json = getWorkflowJson();
    try {
      const workflowJson = JSON.parse(json);
      const output: any = await executeWorkflow(
        workflowJson,
        JSON.parse(workflowInputData)
      );
      setWorkflowOutputData(output);
    } catch (err) {
      openModal("❌ 워크플로우 실행 실패: " + String(err));
    }
  };

  const handleInputValueChange = (e: any) => {
    const value = e.target.value;
    setTextInputValue(value);
    try {
      const parsed = JSON.parse(value);
      setWorkflowInputData(value);
    } catch {}
  };

  // -------------------- JSX 렌더링 --------------------
  return (
    <>
      <BrunnerMessageBox />
      <ReactFlowProvider>
        <div className="flex flex-col">
          <div className="flex flex-row w-full">
            <div className="flex flex-1">
              <ReactFlow
                nodes={nodes.map((n) => ({
                  ...n,
                  style: {
                    background: runningNodeIds.includes(n.id)
                      ? "#FFD700"
                      : n.data.actionName === constants.workflowActions.START ||
                        n.data.actionName === constants.workflowActions.END
                      ? "#ADFF2F"
                      : "#fff",
                    border: "1px solid #222",
                    color: "#000",
                  },
                }))}
                edges={
                  edges.map((e) => ({
                    ...e,
                    markerEnd: { type: "arrowclosed" },
                    style: { stroke: "#ccc", strokeWidth: 2 },
                  })) as Edge<ConditionEdgeData>[]
                }
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
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
              <button className="w-full border" onClick={addNode}>
                Add Node
              </button>
              <button className="w-full border" onClick={exportWorkflow}>
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
                        ? {
                            ...n,
                            data: { ...n.data, ...updates },
                          } // actionName, inputs 등 업데이트
                        : n
                    );

                    const updated =
                      newNodes.find((n: any) => n.id === id) || null;
                    setSelectedNode(updated);
                    return newNodes;
                  });
                }}
              />
              <button
                className="w-full bg-yellow-200 border mt-5"
                onClick={executeWorkflowFromJson}
              >
                Run
              </button>
            </div>
          </div>
          <div className="flex flex-row mt-5">
            <div className="flex flex-col mr-2 w-[calc(50%-10px)]">
              <h4>Input Data</h4>
              <textarea
                className="w-full h-[250px]"
                value={textInputValue}
                onChange={handleInputValueChange}
              />
            </div>
            <div className="flex flex-col ml-2 w-[calc(50%-10px)]">
              <h4>Output Data</h4>
              <textarea
                className="w-full h-[250px]"
                value={JSON.stringify(workflowOutputData, null, 2)}
                readOnly
              />
            </div>
          </div>
        </div>
      </ReactFlowProvider>
    </>
  );
};
