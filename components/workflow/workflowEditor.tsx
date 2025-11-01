import * as React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Input, Button, Table } from "antd";
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

import * as commonFunctions from "@/components/core/commonFunctions";
import * as commonData_WF from "../core/commonData_WF";

import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeProps,
} from "reactflow";

import "reactflow/dist/base.css";
import "reactflow/dist/style.css";

import * as constants from "@/components/core/constants";
import { NodePropertyPanel } from "@/components/workflow/nodePropertyPanel";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type {
  ActionNodeData,
  ConditionEdgeData,
} from "@/components/core/commonData_WF";
import { DBConnectionManagerModal } from "@/components/workflow/dbConnectionManagerModal";
import {
  RequestExecuteWorkflow,
  RequestServer,
} from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { v4 as uuidv4 } from "uuid";
import WorkflowSelector from "./workflowSelector";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { WorkflowDataModal } from "./workflowDataModal";

interface WorkflowEditorProps {
  // key: string;
  workflow: {
    workflowId: string;
    workflowName: string;
    nodes: Node<commonData_WF.ActionNodeData>[];
    edges: Edge<commonData_WF.ConditionEdgeData>[];
  };
  x: number;
  y: number;
  zoom: number;
  openModal?: (msg: string) => void; // 필요하면 타입 정의
  onWorkflowChange?: (workflow: {
    workflowId: string;
    workflowName: string;
    editorState: {
      nodes: Node<commonData_WF.ActionNodeData>[];
      edges: Edge<commonData_WF.ConditionEdgeData>[];
    };
  }) => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  // key,
  workflow,
  x,
  y,
  zoom,
  openModal,
  onWorkflowChange,
}) => {
  const jWorkflow = useRef<any | null>(null);
  // const stepCounterRef = useRef(0);

  // workflowId가 변경되면 필요한 로직 실행 가능

  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [workflowDescription, setWorkflowDescription] = useState("설명 없음");
  const [nodes, setNodes] = useState<Node<ActionNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge<ConditionEdgeData>[]>([]);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>();
  const [edgeClickPos, setEdgeClickPos] = useState<{
    screen: any;
    flow: any;
  } | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(
    null
  );

  // Input Dataset 스키마
  const [designedInputData, setDesignedInputData] =
    useState<commonData_WF.DesignedDataset>({
      INDATA: [
        { name: "column1", type: "string" },
        { name: "column2", type: "number" },
      ],
    });

  // Input Dataset 문자열
  const [workflowInputData, setWorkflowInputData] = useState<
    Record<string, any[]>
  >({ INPUT_TABLE: [{ column1: "test", column2: 123 }] });

  // Output Dataset 스키마
  const [designedOutputData, setDesignedOutputData] = useState<
    Record<string, any[]>
  >({ OUTDATA: [{ key1: "test", key2: 123 }] });
  // Output Dataset 문자열
  const [workflowOutputData, setWorkflowOutputData] = useState<
    Record<string, any[]>
  >({
    OUTDATA: [],
  });

  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isViewWorkflowDataModalOpen, setIsViewWorkflowDataModalOpen] =
    useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([
    "Workflow Info",
  ]);
  const gridSize = 30; // 스냅 그리드 크기

  const snapToGrid = (position: { x: number; y: number }) => ({
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  });

  const initWorkflow = () => {
    const initialNodes = [
      {
        id: uuidv4(),
        type: "default",
        position: snapToGrid({ x: 100, y: 100 }),
        data: {
          label: constants.workflowActions.START,
          actionName: constants.workflowActions.START,
          status: constants.workflowRunStatus.idle,
          design: {
            inputs: commonFunctions.getDefaultInputs(
              constants.workflowActions.START
            ),
            outputs: commonFunctions.getDefaultOutputs(
              constants.workflowActions.START
            ),
            scriptContents: "",
            scriptTimeoutMs: 5000,
          },
          run: { inputs: [], outputs: [] },
        },
      },
      {
        id: uuidv4(),
        type: "default",
        position: snapToGrid({ x: 100, y: 500 }),
        data: {
          label: constants.workflowActions.END,
          actionName: constants.workflowActions.END,
          status: constants.workflowRunStatus.idle,
          design: {
            inputs: commonFunctions.getDefaultInputs(
              constants.workflowActions.END
            ),
            outputs: commonFunctions.getDefaultOutputs(
              constants.workflowActions.END
            ),
            scriptContents: "",
            scriptTimeoutMs: 5000,
          },
          run: { inputs: [], outputs: [] },
        },
      },
    ];

    const initialEdges: Edge<ConditionEdgeData>[] = [];

    setCurrentWorkflow({
      workflowId: uuidv4(),
      workflowName: "New Workflow",
      workflowDescription: "New Workflow",
      currentNodeId: "",
      data: {
        design: { inputs: [], outputs: [] },
        run: { inputs: [], outputs: [] },
      },
      nodes: initialNodes,
      edges: initialEdges,
    });
  };

  const [isInputDataEditorOpen, setIsInputDataEditorOpen] = useState(false);
  const [isInputSchemaEditorOpen, setIsInputSchemaEditorOpen] = useState(false);
  const [isOutputDataEditorOpen, setIsOutputDataEditorOpen] = useState(false);
  const [isOutputSchemaEditorOpen, setIsOutputSchemaEditorOpen] =
    useState(false);
  const [isDBConnectionsModalOpen, setIsDBConnectionsModalOpen] =
    useState(false);

  // SCRIPT 노드 속성
  const [selectedNodeScriptContents, setSelectedNodeScriptContents] =
    useState<string>("");
  const [selectedNodeTimeoutMs, setSelectedNodeTimeoutMs] = useState(5000);

  // 모바일
  const [flowHeightPx, setFlowHeightPx] = useState<number | null>(null);
  const flowBottomReservedPx = 260; // 모바일에서 하단(Inputs/Outputs 등) 예상 높이
  const rfInstanceRef = useRef<any | null>(null); // ReactFlow instance ref

  useEffect(() => {
    if (selectedNode) {
      // Node Property("info")만 열기
      setOpenAccordionItems(["info"]);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!workflow || !workflow.nodes?.length) {
      initWorkflow();
    } else {
      setCurrentWorkflow(workflow);
    }
  }, []);

  // 선택 노드 변경 시
  useEffect(() => {
    syncSelectedNode(selectedNode);
  }, [selectedNode]);

  // 선택 노드에 대한 동기화 작업
  const syncSelectedNode = (selectedNode: any) => {
    if (!selectedNode) {
      setSelectedNodeScriptContents("");
      setSelectedNodeTimeoutMs(5000);
      return;
    }

    switch (selectedNode.data.actionName) {
      case constants.workflowActions.START:
        setSelectedNodeScriptContents(""); // 스크립트 노드가 아니면 초기화
        setSelectedNodeTimeoutMs(0);
        break;
      case constants.workflowActions.END:
        setSelectedNodeScriptContents(""); // 스크립트 노드가 아니면 초기화
        setSelectedNodeTimeoutMs(0);
        break;
      case constants.workflowActions.SCRIPT:
        setSelectedNodeScriptContents(
          selectedNode.data.design.scriptContents ?? ""
        );
        setSelectedNodeTimeoutMs(
          selectedNode.data.design.scriptTimeoutMs ?? 5000
        );
        break;
      case constants.workflowActions.BRANCH:
        setSelectedNodeScriptContents(""); // 스크립트 노드가 아니면 초기화
        setSelectedNodeTimeoutMs(0);
        break;
      case constants.workflowActions.CALL:
        setSelectedNodeScriptContents(""); // 스크립트 노드가 아니면 초기화
        setSelectedNodeTimeoutMs(0);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!jWorkflow.current) return;
    jWorkflow.current.nodes = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!jWorkflow.current) return;
    jWorkflow.current.edges = edges;
  }, [edges]);

  useEffect(() => {
    if (!jWorkflow.current) return;

    if (!jWorkflow.current.data) {
      jWorkflow.current.data = {};
      jWorkflow.current.data.design = {};
      jWorkflow.current.data.run = {};
    }

    jWorkflow.current.data.design.inputs = designedInputData; // 스키마 반영
  }, [designedInputData]);

  useEffect(() => {
    if (!jWorkflow.current) return;

    try {
      jWorkflow.current.data.run.inputs = workflowInputData;
    } catch (err) {
      console.warn("workflowInputData JSON parse failed:", err);
    }
  }, [workflowInputData]);

  // designedOutputData 변경 시
  useEffect(() => {
    if (!jWorkflow.current) return;

    try {
      jWorkflow.current.data.design.outputs = designedOutputData; // 스키마 반영
      jWorkflow.current.data.run.outputs = designedOutputData; // 실제 데이터 반영
    } catch (err) {
      console.warn("designedOutputData parse failed:", err);
    }
  }, [designedOutputData]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds!));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds!));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    const id = uuidv4();
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          id,
          data: { condition: "" },
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#ccc", strokeWidth: 2 },
        } as Edge<ConditionEdgeData>,
        eds!
      )
    );
  }, []);

  const onNodeClick = useCallback(
    (_event: any, node: Node<ActionNodeData>) => setSelectedNode(node),
    []
  );

  const addNode = (position: any) => {
    const id = uuidv4();
    if (!position)
      position = {
        x: 100,
        y: 200,
      };

    setNodes((nds: any) => [
      ...nds,
      {
        id,
        type: "default",
        position: snapToGrid(position), // flow 좌표(react-flow 좌표)를 기대함
        data: {
          label: `Node ${id}`,
          actionName: constants.workflowActions.SCRIPT,
          status: constants.workflowRunStatus.idle,
          design: {
            inputs: commonFunctions.getDefaultInputs(
              constants.workflowActions.SCRIPT
            ),
            outputs: commonFunctions.getDefaultOutputs(
              constants.workflowActions.SCRIPT
            ),
            scriptContents: "",
            scriptTimeoutMs: 0,
          },
          run: { inputs: [], outputs: [] },
        },
      } as Node<ActionNodeData>,
    ]);
    return id;
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) {
      openModal!("Select a node to delete.");
      return;
    }

    // 노드 ID
    const nodeId = selectedNode.id;

    // 1️⃣ 노드 삭제
    setNodes((nds) => nds?.filter((n) => n.id !== nodeId));

    // 2️⃣ 연결된 엣지 삭제 (source 또는 target이 해당 노드인 경우)
    setEdges((eds) =>
      eds?.filter((e) => e.source !== nodeId && e.target !== nodeId)
    );

    // 3️⃣ 선택 상태 초기화
    setSelectedNode(null);
  };

  const getWorkflowJson = (): string => {
    return JSON.stringify(jWorkflow.current, null, 2);
  };

  const exportWorkflow = () => {
    const workflowJson = getWorkflowJson();
    if (!window) return;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<pre style="white-space: pre-wrap; word-wrap: break-word;">${workflowJson}</pre>`
      );
      win.document.close();
    }
  };

  const setCurrentWorkflow = (newVal: any) => {
    if (!newVal) return;

    setWorkflowInputData(newVal.data?.run.inputs);
    setWorkflowOutputData(newVal.data?.run.outputs);

    // 상태값도 새 워크플로우에 맞춰 업데이트
    // setWorkflowId(newVal.workflowId ?? uuidv4());
    setWorkflowName(newVal.workflowName ?? "New Workflow");
    setWorkflowDescription(newVal.workflowDescription ?? "New Workflow");

    // 노드와 엣지 상태 반영
    setNodes(newVal.nodes ?? []);
    setEdges(newVal.edges ?? []);

    // jWorkflow에 교체
    jWorkflow.current = newVal;

    // 입력 데이터 적용
    setDesignedInputData(jWorkflow.current.data?.design?.inputs);
    setWorkflowInputData(jWorkflow.current.data?.run?.inputs);

    // 출력 데이터 적용
    setDesignedOutputData(newVal.data?.design?.outputs);

    const snappedNodes = (newVal.nodes ?? []).map(
      (n: Node<ActionNodeData>) => ({
        ...n,
        position: snapToGrid(n.position),
      })
    );
    setNodes(snappedNodes);
    onWorkflowChange?.(jWorkflow.current);
  };

  const saveWorkflow = async () => {
    try {
      if (!jWorkflow.current) return;

      // 현재 상태값을 jWorkflow.current에 반영
      jWorkflow.current.workflowName = workflowName;
      jWorkflow.current.workflowDescription = workflowDescription;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_SAVE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: jWorkflow.current.workflowId,
        workflowData: JSON.parse(getWorkflowJson()),
      };

      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0) {
        openModal?.(constants.messages.SUCCESS_SAVED);
        if (onWorkflowChange) onWorkflowChange(jWorkflow.current);
      } else {
        openModal?.("❌ 저장 실패: " + jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal?.("❌ 실행 실패: " + String(err));
    }
  };

  const resetWorkflow = async () => {
    try {
      if (!jWorkflow.current.workflowId) return;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_RESET_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: jWorkflow.current.workflowId,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0 && jResponse.workflow_data) {
        const workflowData = jResponse.workflow_data;

        // 서버에서 내려온 데이터 그대로 적용
        setCurrentWorkflow(workflowData);

        openModal?.(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal?.(jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal?.(String(err));
    }
  };

  const deleteWorkflow = async () => {
    try {
      const confirm = await openModal?.(constants.messages.DELETE_ITEM);
      if (!confirm) return;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_DELETE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: jWorkflow.current.workflowId,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0) {
        openModal?.(jResponse.error_message);
        initWorkflow();
      } else {
        openModal?.(jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal?.("❌ 실행 실패: " + String(err));
    }
  };

  const WorkflowOperationPanel = () => {
    return (
      <>
        <div className="flex flex-row ml-1 mt-2">
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={() => addNode(undefined)}
          >
            Add Node
          </Button>
          <Button
            className="w-full border border-black ml-1 general-text-bg-color hover:bg-gray-400"
            onClick={deleteSelectedNode}
          >
            Delete Node
          </Button>
          <Button
            className="w-full border border-black ml-1 general-text-bg-color hover:bg-gray-400"
            onClick={() => setIsViewWorkflowDataModalOpen(true)}
          >
            View Data
          </Button>
        </div>
        <div className="flex flex-row ml-1 mt-1 space-x-1">
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={executeWorkflow}
          >
            Run
          </Button>
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={executeWorkflowByStep}
          >
            Run By Node
          </Button>
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={resetWorkflow}
          >
            Reset
          </Button>
        </div>

        <div className="flex flex-row ml-1 mt-1 space-x-1">
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={saveWorkflow}
          >
            Save
          </Button>
          <Button
            className="w-full border border-black ml-1 general-text-bg-color hover:bg-gray-400"
            onClick={exportWorkflow}
          >
            Export
          </Button>
          <Button
            className="w-full border border-black general-text-bg-color hover:bg-gray-400"
            onClick={deleteWorkflow}
          >
            Delete
          </Button>
        </div>
      </>
    );
  };

  // 워크플로우 실행-시스템 트랜잭션 모드
  const executeWorkflow = async () => {
    try {
      const jResponse = await RequestExecuteWorkflow(
        process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userInfo.getLoginUserId(),
        jWorkflow.current.workflowId,
        constants.transactionMode.System,
        workflowInputData
      );

      if (jResponse.error_code == 0 && jResponse.jWorkflow) {
        setCurrentWorkflow({ ...jResponse.jWorkflow });
        openModal?.(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal?.(jResponse.error_message);
      }
    } catch (err) {
      openModal?.("❌ 실행 실패: " + String(err));
    }
  };

  // 워크플로우 실행-비즈니스 트랜잭션 모드
  const executeWorkflowByStep = async () => {
    try {
      const jResponse = await RequestExecuteWorkflow(
        process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userInfo.getLoginUserId(),
        jWorkflow.current.workflowId,
        constants.transactionMode.Business,
        workflowInputData
      );

      if (jResponse.error_code == 0 && jResponse.jWorkflow) {
        setCurrentWorkflow({ ...jResponse.jWorkflow });
        openModal?.(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal?.(jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal?.("❌ 실행 실패: " + String(err));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const mobile = iw < 768;
      const portrait = ih > iw;

      if (mobile && portrait) {
        // reserve bottom panel area so flow isn't hidden
        setFlowHeightPx(Math.max(200, ih - flowBottomReservedPx));
      } else {
        setFlowHeightPx(null); // default 100% (flex)
      }

      // request ReactFlow to recalc viewport
      setTimeout(() => {
        try {
          rfInstanceRef.current?.fitView?.({ padding: 0.2, duration: 200 });
        } catch (e) {
          // ignore
        }
      }, 120);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // <<< /MOBILE-FIX

  function handleInsertNode(edge: Edge) {
    if (!edgeClickPos) return;

    const flowPos = edgeClickPos.flow; // ✅ 이미 flow 좌표

    const newNodeId = addNode(flowPos); // snapToGrid 적용하려면 addNode 내부에서 처리

    setEdges((eds: any) => {
      const filtered = eds.filter((e: any) => e.id !== edge.id);
      return [
        ...filtered,
        {
          id: `edge_${edge.source}_${newNodeId}`,
          source: edge.source,
          target: newNodeId,
          data: { condition: "" },
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#ccc", strokeWidth: 2 },
        },
        {
          id: `edge_${newNodeId}_${edge.target}`,
          source: newNodeId,
          target: edge.target,
          data: { condition: "" },
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#ccc", strokeWidth: 2 },
        },
      ];
    });

    setSelectedEdge(null);
    setEdgeClickPos(null);
  }

  const onFlowClick = () => {
    setSelectedEdge(null);
    setEdgeClickPos(null);
  };

  const onEdgeClick = (event: any, edge: Edge) => {
    event.stopPropagation();

    const flowElement = document.querySelector(".react-flow__pane");
    const bounds = flowElement?.getBoundingClientRect();
    if (!bounds) return;

    const screenPos = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    // useReactFlow 대신 rfInstanceRef.current.project 사용 (존재 확인)
    let flowPos = { x: 0, y: 0 };
    try {
      const proj = rfInstanceRef.current?.project;
      if (typeof proj === "function") {
        flowPos = proj(screenPos);
      } else {
        // fallback: 대략적인 좌표 복사 (비정상 상황 방어)
        flowPos = screenPos;
      }
    } catch (err) {
      flowPos = screenPos;
    }

    setSelectedEdge(edge);
    setEdgeClickPos({ screen: screenPos, flow: flowPos });
  };

  return (
    <>
      <ReactFlowProvider>
        <div className="flex flex-row w-full h-full relative">
          <div className="flex flex-col flex-grow h-full min-w-0">
            <div className="flex-1 relative">
              <div
                id="flow-wrapper"
                className="relative rounded-lg border shadow-sm overflow-hidden w-full"
                style={{
                  height: flowHeightPx ? `${flowHeightPx}px` : "100%",
                  minHeight: 320,
                }}
                onClick={onFlowClick}
              >
                <ReactFlow
                  onMove={(event: MouseEvent | TouchEvent, viewport) => {
                    onWorkflowChange?.(jWorkflow.current);
                  }}
                  nodes={nodes?.map((n) => ({
                    ...n,
                    type:
                      n.data.actionName === constants.workflowActions.BRANCH
                        ? "branch"
                        : "default", // BRANCH면 branchNode로 렌더링
                    style: {
                      background:
                        n.id === jWorkflow.current?.currentNodeId
                          ? "#FFA500"
                          : n.data.actionName ===
                              constants.workflowActions.START ||
                            n.data.actionName === constants.workflowActions.END
                          ? "#ADFF2F"
                          : "#fff",
                      border:
                        n.id === jWorkflow.current?.currentNodeId
                          ? "1px solid #FF4500"
                          : "1px solid #222",
                      color: "#000",
                    },
                  }))}
                  edges={edges?.map((e) => ({
                    ...e,
                    markerEnd: { type: "arrowclosed" } as any,
                    style: { stroke: "#ccc", strokeWidth: 2 },
                  }))}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onEdgeUpdate={(oldEdge, newConnection) => {
                    // 엣지가 드래그되거나 수정될 때 호출됩니다.
                    const updatedEdges: Edge<ConditionEdgeData>[] = edges.map(
                      (edge) =>
                        edge.id === oldEdge.id
                          ? { ...oldEdge, ...newConnection }
                          : edge
                    ) as Edge<ConditionEdgeData>[];
                    setEdges(updatedEdges);
                  }}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  onPaneClick={() => setSelectedNode(null)}
                  fitView
                  snapToGrid
                  snapGrid={[30, 30]}
                  onInit={(instance) => {
                    // instance.setViewport({ x, y, zoom });
                    rfInstanceRef.current = instance;
                  }}
                  nodeTypes={commonData_WF.nodeTypes}
                  onEdgeClick={onEdgeClick}
                >
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
              {selectedEdge && edgeClickPos && (
                <div
                  style={{
                    position: "absolute",
                    left: edgeClickPos?.screen.x,
                    top: edgeClickPos?.screen.y,
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                  }}
                >
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleInsertNode(selectedEdge)}
                  >
                    ＋ Node
                  </Button>
                </div>
              )}
              {/* Flow 영역 안 버튼 (토글 방식) */}
              <Button
                className="absolute top-2 right-2 px-2 py-1 semi-text-bg-color rounded"
                onClick={() => setIsRightPanelOpen((prev) => !prev)}
              >
                ⚙️
              </Button>
            </div>
            {/* 🧾 하단: Inputs / Outputs (좌우 배치 + 접힘 가능) */}
            <Accordion type="multiple" defaultValue={[]} className="mt-3">
              <div className="flex flex-row w-full gap-2">
                {/* Inputs */}
                <div className="flex-1 border rounded p-2">
                  <AccordionItem value="inputs">
                    <AccordionTrigger>📥 Workflow Inputs</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-row space-x-2 mb-2">
                        <Button
                          className="general-text-bg-color border border-black rounded"
                          onClick={() => setIsInputSchemaEditorOpen(true)}
                        >
                          Edit Schema
                        </Button>
                        {/* Input Schema/Data 모달 */}
                        {isInputSchemaEditorOpen && (
                          <JsonDatasetEditorModal
                            open={isInputSchemaEditorOpen}
                            title="Input Schema"
                            mode="schema"
                            value={designedInputData}
                            onConfirm={(newSchema) => {
                              setDesignedInputData(
                                newSchema as commonData_WF.DesignedDataset
                              );
                              const newDataObj: Record<string, any> = {};
                              for (const [tableName, rows] of Object.entries(
                                newSchema
                              )) {
                                if (Array.isArray(rows) && rows.length > 0) {
                                  const firstRow = rows[0];
                                  const newRow: Record<string, any> = {};
                                  for (const key in firstRow) {
                                    const value = firstRow[key];
                                    newRow[key] =
                                      commonFunctions.getJsonDefaultTypedValue(
                                        value
                                      );
                                  }
                                  newDataObj[tableName] = [newRow];
                                } else {
                                  newDataObj[tableName] = [];
                                }
                              }
                              setWorkflowInputData(newDataObj);
                            }}
                            onCancel={() => setIsInputSchemaEditorOpen(false)}
                          />
                        )}

                        {isInputDataEditorOpen && (
                          <JsonDatasetEditorModal
                            open={isInputDataEditorOpen}
                            title="Input Data"
                            mode="data"
                            value={workflowInputData}
                            onConfirm={(newData) => {
                              setWorkflowInputData(newData);
                            }}
                            onCancel={() => setIsInputDataEditorOpen(false)}
                          />
                        )}
                        <Button
                          className="general-text-bg-color border border-black rounded"
                          onClick={() => setIsInputDataEditorOpen(true)}
                        >
                          Edit Data
                        </Button>
                      </div>
                      <textarea
                        className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
                        value={JSON.stringify(workflowInputData, null, 2)}
                        readOnly
                      />
                    </AccordionContent>
                  </AccordionItem>
                </div>

                {/* Outputs */}
                <div className="flex-1 border rounded p-2">
                  <AccordionItem value="outputs">
                    <AccordionTrigger>📤 Workflow Outputs</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-row mb-2 space-x-2">
                        <Button
                          className="general-text-bg-color border border-black rounded"
                          onClick={() => setIsOutputSchemaEditorOpen(true)}
                        >
                          Edit Schema
                        </Button>
                        {isOutputSchemaEditorOpen && (
                          <JsonDatasetEditorModal
                            open={isOutputSchemaEditorOpen}
                            title="Output Schema"
                            mode="schema"
                            value={designedOutputData}
                            onConfirm={(newSchema) => {
                              setDesignedOutputData(
                                newSchema as commonData_WF.DesignedDataset
                              );
                              const newDataObj: Record<string, any> = {};
                              for (const [tableName, rows] of Object.entries(
                                newSchema
                              )) {
                                if (Array.isArray(rows) && rows.length > 0) {
                                  const firstRow = rows[0];
                                  const newRow: Record<string, any> = {};
                                  for (const key in firstRow) {
                                    const value = firstRow[key];
                                    newRow[key] =
                                      commonFunctions.getJsonDefaultTypedValue(
                                        value
                                      );
                                  }
                                  newDataObj[tableName] = [newRow];
                                } else {
                                  newDataObj[tableName] = [];
                                }
                              }
                              setWorkflowOutputData(newDataObj);
                            }}
                            onCancel={() => setIsOutputSchemaEditorOpen(false)}
                          />
                        )}
                        {isOutputDataEditorOpen && (
                          <JsonDatasetEditorModal
                            open={isOutputDataEditorOpen}
                            title="Output Data"
                            mode="data"
                            value={workflowOutputData}
                            onConfirm={(newData) => {
                              setWorkflowOutputData(newData);
                            }}
                            onCancel={() => setIsOutputDataEditorOpen(false)}
                          />
                        )}
                        <Button
                          className="general-text-bg-color border border-black rounded"
                          onClick={() => setIsOutputDataEditorOpen(true)}
                        >
                          Edit Data
                        </Button>
                      </div>
                      <textarea
                        className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
                        value={JSON.stringify(workflowOutputData, null, 2)}
                        readOnly
                      />
                    </AccordionContent>
                  </AccordionItem>
                </div>
              </div>
            </Accordion>
          </div>

          {/* ⚙️ 오른쪽 패널 (토글) */}
          {isRightPanelOpen && (
            <div
              className="flex flex-col justify-top h-full md:h-auto ml-0 md:ml-1 border-t md:border-l p-2 z-40 semi-text-bg-color"
              style={{
                width: "auto", // 콘텐츠에 따라 자동 폭
                minWidth: "300px", // 너무 좁아지지 않게 최소 폭
                maxWidth: "800px", // 화면 넘치지 않게 최대 폭 (선택)
                overflowY: "auto", // 세로 스크롤 유지
                overflowX: "hidden", // 가로 스크롤은 숨김
              }}
            >
              <Accordion
                value={openAccordionItems} // <-- controlled value
                type="multiple"
                defaultValue={["workflowInfo"]}
                className="mt-3"
                onValueChange={(vals: string[]) => setOpenAccordionItems(vals)}
              >
                {/* Workflow Info */}
                <AccordionItem value="workflowInfo">
                  <AccordionTrigger>📝 Workflow Info</AccordionTrigger>
                  <AccordionContent>
                    <WorkflowSelector
                      onSelect={(wfSelected: any) => {
                        initWorkflow();

                        setCurrentWorkflow(wfSelected.workflow_data);
                      }}
                      selectedWorkflow={jWorkflow.current}
                    />
                    <div className="p-2 border rounded mt-2">
                      <div>ID: {jWorkflow.current.workflowId}</div>
                      <div className="flex flex-row mt-2">
                        Name:
                        <input
                          className="flex-1 w-auto ml-2"
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-row mt-2">
                        Description:
                        <textarea
                          className="flex-1 w-auto ml-2"
                          value={workflowDescription}
                          rows={1}
                          onChange={(e) =>
                            setWorkflowDescription(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsDBConnectionsModalOpen(true)}
                      className="ml-1 mt-2 px-2 py-1 rounded  general-text-bg-color border border-black"
                    >
                      Database...
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Workflow Operation */}
                <AccordionItem value="operation">
                  <AccordionTrigger>⚙️ Workflow Operation</AccordionTrigger>
                  <AccordionContent>
                    <WorkflowOperationPanel />
                  </AccordionContent>
                </AccordionItem>

                {/* Node Property */}
                <AccordionItem value="info">
                  <AccordionTrigger>🧩 Node Property</AccordionTrigger>
                  <AccordionContent>
                    <NodePropertyPanel
                      workflowId={jWorkflow.current.workflowId}
                      nodes={nodes!}
                      node={selectedNode}
                      onNodeUpdate={(id, updates) => {
                        setNodes((nds) => {
                          const newNodes = nds?.map((n) => {
                            if (n.id !== id) return n;

                            let newDesign: Partial<typeof n.data.design> =
                              n.data?.design || {};
                            if (
                              (updates.actionName &&
                                updates.actionName !== n.data?.actionName) ||
                              (n.data.actionName === "Branch" &&
                                n.data.design.mode !== updates.design?.mode)
                            ) {
                              newDesign = {};
                            }
                            if (updates.design) {
                              newDesign = { ...newDesign, ...updates.design };
                            }

                            // ✅ 수정된 부분
                            const mergedData = {
                              ...n.data,
                              ...(updates.data ?? {}), // updates.data 내용만 병합
                            };

                            var newLabel =
                              updates.data?.label ??
                              updates.label ??
                              mergedData.label;

                            return {
                              ...n,
                              data: {
                                ...mergedData,
                                actionName:
                                  updates.actionName ?? n.data?.actionName,
                                label: newLabel,
                                design: newDesign,
                              },
                            };
                          });

                          const updatedWorkflow = {
                            ...jWorkflow.current,
                            nodes: newNodes,
                          };
                          setSelectedNode(
                            newNodes?.find((nn) => nn.id === id) || null
                          );
                          setCurrentWorkflow(updatedWorkflow);

                          return newNodes;
                        });
                      }}
                      openModal={openModal!}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>

        {/* WorkflowDataModal */}
        {isViewWorkflowDataModalOpen && jWorkflow.current.workflowId && (
          <WorkflowDataModal
            workflowId={jWorkflow.current.workflowId}
            open={isViewWorkflowDataModalOpen}
            onClose={() => setIsViewWorkflowDataModalOpen(false)}
          />
        )}

        <DBConnectionManagerModal
          open={isDBConnectionsModalOpen}
          onOpenChange={setIsDBConnectionsModalOpen}
        />
      </ReactFlowProvider>
    </>
  );
};
