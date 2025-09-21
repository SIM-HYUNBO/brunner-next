import React, { useState, useCallback, useRef } from "react";
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
import { actionMap } from "@/components/workflow/actionRegistry";
import { NodePropertyEditor } from "@/components/workflow/nodePropertyEditor";

// 노드 데이터 타입
export interface ActionNodeData {
  label: string;
  actionName: string;
  params: Record<string, any>;
  status: string;
}

// 엣지 데이터 타입
export interface ConditionEdgeData {
  condition?: string;
}

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
        params: {},
        status: constants.workflowNodeStatus.idle,
      },
    },
    {
      id: constants.workflowActions.END,
      type: "default",
      position: { x: 100, y: 500 },
      data: {
        label: constants.workflowActions.END,
        actionName: constants.workflowActions.END,
        params: {},
        status: constants.workflowNodeStatus.idle,
      },
    },
  ],
  initialEdges = [],
}) => {
  const stepCounterRef = useRef(0);

  const [workflowId, setWorkflowId] = useState(nanoid());
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [workflowDescription, setWorkflowDescription] = useState("설명 없음");

  const generateStepId = useCallback(() => {
    stepCounterRef.current += 1;
    return stepCounterRef.current;
  }, []);

  const [nodes, setNodes] = useState<Node<ActionNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<ConditionEdgeData>[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(
    null
  );
  const [selectedEdge, setSelectedEdge] =
    useState<Edge<ConditionEdgeData> | null>(null);

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

  const onConnect = useCallback(async (connection: Connection) => {
    const stepId = generateStepId().toString();
    setEdges((eds: any) =>
      addEdge(
        {
          ...connection,
          id: stepId,
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

  const addNode = () => {
    const id = generateStepId().toString();
    setNodes((nds: any) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
        data: {
          label: `Node ${id}`,
          actionName: constants.workflowActions.SLEEP,
          params: { ms: 1000 },
          status: constants.workflowNodeStatus.idle,
        },
      },
    ]);
  };

  const updateNodeParams = () => {
    if (!selectedNode) return;
    const newParams = prompt(
      "Enter JSON params:",
      JSON.stringify(selectedNode.data.params)
    );
    if (newParams) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, params: JSON.parse(newParams) } }
            : n
        )
      );
    }
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

  const getWorkflowJson = (): string => {
    const workflow = {
      workflowId,
      workflowName,
      workflowDescription,
      nodes,
      edges,
    };
    return JSON.stringify(workflow, null, 2);
  };

  const exportWorkflow = () => {
    const workflowJson = getWorkflowJson();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <pre style="white-space: pre-wrap; word-wrap: break-word;">
${workflowJson}
        </pre>
      `);
      win.document.close();
    }
  };

  const { BrunnerMessageBox, openModal } = useModal();

  async function executeWorkflow(workflow: any = {}, workflowData: any = {}) {
    const nodes: Node<any>[] = workflow.nodes;
    const edges: Edge<any>[] = workflow.edges;

    const startNode = nodes.find(
      (n) => n.data.actionName === constants.workflowActions.START
    );
    if (!startNode) {
      openModal(constants.messages.WORKFLOW_STARTNODE_NOT_FOUND);
      return;
    }

    const edgeMap: Record<string, Edge<any>[]> = {};
    edges.forEach((e) => {
      if (!e.source) return; // source가 없으면 건너뛰기
      if (!edgeMap[e.source]) edgeMap[e.source] = [];
      edgeMap[e.source]!.push(e);
    });

    function hasPathToEnd(
      nodeId: string,
      visited = new Set<string>()
    ): boolean {
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);

      const outgoingEdges = edgeMap[nodeId] ?? []; // 없으면 빈 배열
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!targetNode) continue; // targetNode 없으면 건너뛰기
        if (targetNode.data?.actionName === constants.workflowActions.END)
          return true;
        if (hasPathToEnd(targetNode.id, visited)) return true;
      }

      return false;
    }

    if (!hasPathToEnd(startNode.id)) {
      openModal(constants.messages.WORKFLOW_NODES_NOT_CONNECTED);
      return;
    }

    const visitedNodes = new Set<string>();

    async function traverse(nodeId: string) {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const shouldRun = !node.data.if || Boolean(node.data.if);
      if (shouldRun) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: constants.workflowNodeStatus.running,
                  },
                }
              : n
          )
        );

        await workflowEngine.runWorkflowStep(
          nodeId,
          { actionName: node.data.actionName, params: node.data.params },
          workflowData
        );

        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: constants.workflowNodeStatus.idle,
                  },
                }
              : n
          )
        );
      }

      const outgoingEdges = edgeMap[nodeId] || [];
      for (const edge of outgoingEdges) {
        if (!edge.data?.condition || Boolean(edge.data.condition)) {
          await traverse(edge.target);
        }
      }
    }

    await traverse(startNode.id);
  }

  async function executeWorkflowFromJson(
    workflowJson: string,
    context: any = {}
  ) {
    try {
      const jWorkflow = JSON.parse(workflowJson);

      if (jWorkflow.workflowId) setWorkflowId(jWorkflow.workflowId);
      if (jWorkflow.workflowName) setWorkflowName(jWorkflow.workflowName);
      if (jWorkflow.workflowDescription)
        setWorkflowDescription(jWorkflow.workflowDescription);

      if (!jWorkflow.nodes || !jWorkflow.edges)
        throw new Error("JSON에 nodes 또는 edges가 없습니다.");

      await executeWorkflow(
        { nodes: jWorkflow.nodes, edges: jWorkflow.edges },
        context
      );
    } catch (err) {
      openModal("❌ 워크플로우 JSON 파싱 실패: " + String(err));
    }
  }

  return (
    <>
      <BrunnerMessageBox />
      <ReactFlowProvider>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flex: 1 }}>
            <ReactFlow
              nodes={nodes.map((n) => ({
                ...n,
                style: {
                  background:
                    n.data.status === constants.workflowNodeStatus.running
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
                })) as Edge<any>[]
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
          <div
            style={{ width: 250, padding: 10, borderLeft: "1px solid #ccc" }}
          >
            <h3>Editor</h3>
            <button
              className="w-full semi-text-bg-color border"
              onClick={addNode}
            >
              Add Node
            </button>
            <button
              className="w-full semi-text-bg-color border"
              onClick={updateNodeParams}
              disabled={!selectedNode}
            >
              Edit Node Params
            </button>
            <button
              className="w-full semi-text-bg-color border"
              onClick={updateEdgeCondition}
              disabled={!selectedEdge}
            >
              Edit Edge Condition
            </button>
            <button
              className="w-full semi-text-bg-color border"
              onClick={exportWorkflow}
            >
              Export JSON
            </button>
            <NodePropertyEditor
              workflowId={workflowId}
              workflowName={workflowName}
              workflowDescription={workflowDescription}
              onWorkflowUpdate={({ workflowName, workflowDescription }) => {
                if (workflowName !== undefined) setWorkflowName(workflowName);
                if (workflowDescription !== undefined)
                  setWorkflowDescription(workflowDescription);
              }}
              node={selectedNode}
              onUpdate={(id, updates) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
                  )
                );
              }}
              actions={Array.from(actionMap.keys())}
            />
          </div>
        </div>
      </ReactFlowProvider>
      <button
        onClick={() =>
          executeWorkflowFromJson(getWorkflowJson(), { input: {} })
        }
      >
        Run workflow
      </button>
    </>
  );
};
