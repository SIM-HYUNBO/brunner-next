import React, { useState, useCallback } from "react";
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
import { nanoid } from "nanoid";
import "reactflow/dist/style.css";
import { runWorkflow } from "@/components/workflow/workflowEngine";
import * as constants from "@/components/core/constants";

// 노드 데이터 타입
export interface ActionNodeData {
  label: string;
  actionName: string;
  params: Record<string, any>;
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
      id: "1",
      type: "default",
      position: { x: 100, y: 100 },
      data: {
        label: "Start",
        actionName: constants.workflowActions.start,
        params: {},
      },
    },
    {
      id: "2",
      type: "default",
      position: { x: 100, y: 500 },
      data: {
        label: "End",
        actionName: constants.workflowActions.end,
        params: {},
      },
    },
  ],
  initialEdges = [],
}) => {
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

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: nanoid(),
            data: { condition: "" },
          } as Edge<ConditionEdgeData>,
          eds
        )
      ),
    []
  );

  const onNodeClick = useCallback(
    (_: any, node: Node<ActionNodeData>) => setSelectedNode(node),
    []
  );
  const onEdgeClick = useCallback(
    (_: any, edge: Edge<ConditionEdgeData>) => setSelectedEdge(edge),
    []
  );

  const addNode = () => {
    const id = nanoid();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
        data: {
          label: `Node ${id}`,
          actionName: constants.workflowActions.wait,
          params: { ms: 1000 },
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

  const exportWorkflow = () => {
    const workflow = { nodes, edges };
    alert(JSON.stringify(workflow, null, 2));
  };

  // nodes: Node<ActionNodeData>[]
  // edges: Edge<ConditionEdgeData>[]
  async function executeReactFlowWorkflow(
    nodes: any,
    edges: any,
    context = {}
  ) {
    // 1️⃣ Edge의 조건을 Node.if에 적용
    edges.forEach((edge: any) => {
      const targetNode = nodes.find((n: any) => n.id === edge.target);
      if (targetNode && edge.data?.condition) {
        targetNode.data.if = edge.data.condition;
      }
    });

    // 2️⃣ nodes → workflow.steps
    const workflowJson = {
      steps: nodes.map((node: any) => ({
        actionName: node.data.actionName,
        params: node.data.params,
        if: node.data.if,
        continueOnError: node.data.continueOnError,
      })),
    };

    // 3️⃣ runWorkflow 실행
    const result = await runWorkflow(workflowJson, context);
    console.log("Workflow result:", result);
    return result;
  }

  return (
    <>
      <ReactFlowProvider>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flex: 1 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
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
            <button onClick={addNode}>Add Node</button>
            <button onClick={updateNodeParams} disabled={!selectedNode}>
              Edit Node Params
            </button>
            <button onClick={updateEdgeCondition} disabled={!selectedEdge}>
              Edit Edge Condition
            </button>
            <button onClick={exportWorkflow}>Export JSON</button>
          </div>
        </div>
      </ReactFlowProvider>
      <button
        onClick={() => {
          executeReactFlowWorkflow(nodes, edges, { input: {} });
        }}
      >
        Run workflow
      </button>
    </>
  );
};
