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
import { NodePropertyPanel } from "@/components/workflow/nodePropertyPanel";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type {
  ActionNodeData,
  ConditionEdgeData,
} from "@/components/core/commonData";
import { DBConnectionManagerModal } from "@/components/workflow/dbConnectionManagerModal";
import RequestServer from "@/components/core/client/requestServer";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { v4 as uuidv4 } from "uuid";
import WorkflowSelector from "./workflowSelector";
import * as commonFunctions from "@/components/core/commonFunctions";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { WorkflowDataModal } from "./workflowDataModal";

interface WorkflowEditorProps {
  initialNodes?: Node<ActionNodeData>[];
  initialEdges?: Edge<ConditionEdgeData>[];
}

export type DesignColumn = {
  name: string;
  type: "string" | "number" | "boolean" | "object";
};

export type DesignedDataset = Record<string, DesignColumn[]>;
type InputDataset = Record<string, Record<string, any>[]>;

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  initialNodes = [
    {
      id: uuidv4(),
      type: "default",
      position: { x: 100, y: 100 },
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
      position: { x: 100, y: 500 },
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
  ],
  initialEdges = [],
}) => {
  const jWorkflow = useRef<any | null>(null);
  const stepCounterRef = useRef(0);
  const { BrunnerMessageBox, openModal } = useModal();

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [workflowDescription, setWorkflowDescription] = useState("설명 없음");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isWorkflowDataModalOpen, setIsWorkflowDataModalOpen] = useState(false);

  const [workflowInputData, setWorkflowInputData] = useState<string>(
    JSON.stringify({ INPUT_TABLE: [{ key1: "test", key2: 123 }] }, null, 2)
  );

  const initWorkflow = () => {
    const initialNodes = [
      {
        id: uuidv4(),
        type: "default",
        position: { x: 100, y: 100 },
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
        position: { x: 100, y: 500 },
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
      workflowName: "new workflow",
      workflowDescription: "new workflow",
      currentNodeId: "",
      data: {
        design: { inputs: [], outputs: [] },
        run: { inputs: [], outputs: [] },
      },
      nodes: initialNodes,
      edges: initialEdges,
    });
  };

  const [designedInputData, setDesignedInputData] = useState<DesignedDataset>({
    INPUT_TABLE: [
      { name: "key1", type: "string" },
      { name: "key2", type: "number" },
    ],
  });

  const [designedOutputData, setDesignedOutputData] = useState<string>(
    JSON.stringify({ OUTPUT_TABLE: [{ key1: "test", key2: 123 }] }, null, 2)
  );

  const [nodes, setNodes] = useState<Node<ActionNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<ConditionEdgeData>[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<ActionNodeData> | null>(
    null
  );

  const [isInputDataEditorOpen, setIsInputDataEditorOpen] = useState(false);
  const [isInputSchemaEditorOpen, setIsInputSchemaEditorOpen] = useState(false);
  const [isOutputSchemaEditorOpen, setIsOutputSchemaEditorOpen] =
    useState(false);
  const [dbConnectionsModalOpen, setDbConnectionsModalOpen] = useState(false);
  const [selectedNodeScript, setSelectedNodeScript] = useState<string>("");
  const [selectedNodeTimeoutMs, setSelectedNodeTimeoutMs] = useState(5000);

  // <<< MOBILE-FIX: state for responsive behavior
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isPortrait, setIsPortrait] = useState<boolean>(
    typeof window !== "undefined"
      ? window.innerHeight > window.innerWidth
      : true
  );
  const [flowHeightPx, setFlowHeightPx] = useState<number | null>(null);
  const flowBottomReservedPx = 260; // 모바일에서 하단(Inputs/Outputs 등) 예상 높이
  const rfInstanceRef = useRef<any | null>(null); // ReactFlow instance ref
  // <<< /MOBILE-FIX

  useEffect(() => {
    setWorkflowId(uuidv4());
    initWorkflow();
  }, []);

  // 선택 노드 변경 시
  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeScript("");
      setSelectedNodeTimeoutMs(5000);
      return;
    }

    if (selectedNode.data.actionName === constants.workflowActions.SCRIPT) {
      setSelectedNodeScript(selectedNode.data.design.scriptContents ?? "");
      setSelectedNodeTimeoutMs(
        selectedNode.data.design.scriptTimeoutMs ?? 5000
      );
    } else {
      setSelectedNodeScript(""); // 스크립트 노드가 아니면 초기화
      setSelectedNodeTimeoutMs(0);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!jWorkflow.current) return;
    jWorkflow.current.nodes = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!jWorkflow.current) return;
    jWorkflow.current.edges = edges;
  }, [edges]);

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
      const parsed = JSON.parse(designedOutputData);
      return Object.keys(parsed).length ? parsed : { table1: [] };
    } catch {
      return { table1: [] };
    }
  }, [designedOutputData]);

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
  };

  const getWorkflowJson = (): string => {
    return JSON.stringify(jWorkflow.current, null, 2);
  };

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

  const setCurrentWorkflow = (newVal: any) => {
    if (!newVal) return;

    // jWorkflow에 교체
    jWorkflow.current = newVal;

    // 상태값도 새 워크플로우에 맞춰 업데이트
    setWorkflowId(newVal.workflowId ?? uuidv4());
    setWorkflowName(newVal.workflowName ?? "새 워크플로우");
    setWorkflowDescription(newVal.workflowDescription ?? "설명 없음");

    // 노드와 엣지 상태 반영
    setNodes(newVal.nodes ?? []);
    setEdges(newVal.edges ?? []);

    // 입력 데이터 적용
    setWorkflowInputData(
      newVal.data?.run?.inputs
        ? JSON.stringify(newVal.data.run.inputs, null, 2)
        : JSON.stringify(
            { INPUT_TABLE: [{ key1: "test", key2: 123 }] },
            null,
            2
          )
    );

    // 출력 데이터 적용
    setDesignedOutputData(
      newVal.data?.run?.outputs
        ? JSON.stringify(newVal.data.run.outputs, null, 2)
        : JSON.stringify({ OUTPUT_TABLE: [] }, null, 2)
    );

    stepCounterRef.current = 0;
    // jWorkflow.current = newVal;
  };

  const saveWorkflow = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_SAVE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
        workflowData: JSON.parse(getWorkflowJson()),
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0) {
        openModal("Successfully updated workflow.");
      }
    } catch (err) {
      console.error(err);
      openModal("❌ 실행 실패: " + String(err));
    }
  };

  const resetWorkflow = async () => {
    try {
      if (!workflowId) return;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_RESET_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
      };

      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0 && jResponse.workflow_data) {
        const workflowData = jResponse.workflow_data;

        // 서버에서 내려온 데이터 그대로 적용
        setCurrentWorkflow(workflowData);

        openModal(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal(String(err));
    }
  };

  const deleteWorkflow = async () => {
    try {
      const confirm = await openModal(constants.messages.DELETE_ITEM);
      if (!confirm) return;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_DELETE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0) {
        openModal("Successfully delete workflow.");
        initWorkflow();
      }
    } catch (err) {
      console.error(err);
      openModal("❌ 실행 실패: " + String(err));
    }
  };

  const executeWorkflowFromTableEditor = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_EXECUTE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
        transactionMode: constants.transactionMode.System,
        inputs: workflowInputDataObj,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0 && jResponse.jWorkflow) {
        setCurrentWorkflow({ ...jResponse.jWorkflow });
        openModal(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      openModal("❌ 실행 실패: " + String(err));
    }
  };

  const executeWorkflowStepByStep = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_EXECUTE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
        transactionMode: constants.transactionMode.Business,
        currentNodeId: jWorkflow.current?.currentNodeId ?? "",
        inputs: workflowInputDataObj,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0 && jResponse.jWorkflow) {
        setCurrentWorkflow({ ...jResponse.jWorkflow });
        openModal(constants.messages.SUCCESS_FINISHED);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      console.error(err);
      openModal("❌ 실행 실패: " + String(err));
    }
  };

  const WorkflowOperationPanel = () => {
    return (
      <>
        <div className="flex flex-row ml-1 mt-2">
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={addNode}
          >
            Add Node
          </button>
          <button
            className="w-full border border-black ml-1 semi-text-bg-color hover:bg-gray-400"
            onClick={exportWorkflow}
          >
            Export
          </button>
          <button
            className="w-full border border-black ml-1 semi-text-bg-color hover:bg-gray-400"
            onClick={() => setIsWorkflowDataModalOpen(true)}
          >
            View Data
          </button>
        </div>
        <div className="flex flex-row ml-1 mt-1 space-x-1">
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={resetWorkflow}
          >
            Reset
          </button>
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={executeWorkflowFromTableEditor}
          >
            Run
          </button>
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={executeWorkflowStepByStep}
          >
            Run By Node
          </button>
        </div>

        <div className="flex flex-row ml-1 mt-1 space-x-1">
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={saveWorkflow}
          >
            Save
          </button>
          <button
            className="w-full border border-black semi-text-bg-color hover:bg-gray-400"
            onClick={deleteWorkflow}
          >
            Delete
          </button>
        </div>
      </>
    );
  };

  // <<< MOBILE-FIX: resize handling to compute flow height and call fitView
  useEffect(() => {
    const handleResize = () => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const mobile = iw < 768;
      const portrait = ih > iw;
      setIsMobile(mobile);
      setIsPortrait(portrait);

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

  return (
    <>
      <ReactFlowProvider>
        {/* <<< MOBILE-FIX: Use h-screen so we can compute child heights on mobile; and switch to column on small screens */}
        <div className="flex flex-col md:flex-row w-full h-screen relative">
          <BrunnerMessageBox />
          {/* 🧭 왼쪽: 워크플로우 다이어그램 */}
          <div className="flex-1 relative">
            {/* wrapper with explicit min height and dynamic height for mobile portrait */}
            <div
              className="relative rounded-lg border shadow-sm overflow-hidden w-full"
              style={{
                height: flowHeightPx ? `${flowHeightPx}px` : "100%",
                minHeight: 320,
              }}
            >
              <ReactFlow
                nodes={nodes.map((n) => ({
                  ...n,
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
                        ? "3px solid #FF4500"
                        : "1px solid #222",
                    color: "#000",
                  },
                }))}
                edges={edges.map((e) => ({
                  ...e,
                  markerEnd: { type: "arrowclosed" } as any,
                  style: { stroke: "#ccc", strokeWidth: 2 },
                }))}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelectedNode(null)}
                fitView
                snapToGrid
                snapGrid={[30, 30]}
                onInit={(instance) => {
                  // store instance so we can call fitView on resize
                  rfInstanceRef.current = instance;
                }}
              >
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>

            {/* Flow 영역 안 버튼 (토글 방식) */}
            <button
              className="absolute top-2 right-2 z-50 px-2 py-1 bg-blue-500 text-white rounded"
              onClick={() => setIsRightPanelOpen((prev) => !prev)}
            >
              ⚙️
            </button>
          </div>

          {/* ⚙️ 오른쪽 패널 (토글) */}
          {isRightPanelOpen && (
            <div className="flex flex-col justify-top h-full md:h-auto ml-0 md:ml-1 w-full md:w-[380px] overflow-y-auto border-t md:border-l p-2  z-40 semi-text-bg-color">
              <h2 className="flex justify-between items-center">
                Workflow Info
              </h2>
              <WorkflowSelector
                onSelect={(wfSelected: any) => {
                  setCurrentWorkflow(wfSelected.workflow_data);
                }}
                selectedWorkflow={jWorkflow.current}
              />

              <div className="p-2 border rounded mt-2">
                <div>ID: {workflowId}</div>
                <div className="flex flex-row mt-2">
                  이름:
                  <input
                    className="flex-1 w-auto ml-2"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  />
                </div>
                <div className="flex flex-row mt-2">
                  설명:
                  <textarea
                    className="flex-1 w-auto ml-2"
                    value={workflowDescription}
                    rows={1}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={() => setDbConnectionsModalOpen(true)}
                className="ml-1 mt-2 px-2 py-1 rounded semi-text-bg-color border"
              >
                Database...
              </button>

              {/* 🪗 Accordion - 접을 수 있는 패널들 */}
              <Accordion type="multiple" defaultValue={[]} className="mt-3">
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
                      workflowId={workflowId}
                      workflowName={workflowName}
                      workflowDescription={workflowDescription}
                      node={selectedNode}
                      nodes={nodes}
                      scriptContents={selectedNodeScript}
                      scriptTimeoutMs={selectedNodeTimeoutMs}
                      onWorkflowUpdate={({
                        workflowName,
                        workflowDescription,
                      }) => {
                        if (workflowName !== undefined)
                          setWorkflowName(workflowName);
                        if (workflowDescription !== undefined)
                          setWorkflowDescription(workflowDescription);
                      }}
                      onNodeUpdate={(id, updates) => {
                        setNodes((nds) => {
                          const newNodes = nds.map((n) => {
                            if (n.id !== id) return n;
                            const designUpdates = updates.design ?? {};
                            const otherUpdates = {
                              ...updates,
                              design: undefined,
                            };
                            return {
                              ...n,
                              data: {
                                ...n.data,
                                ...otherUpdates,
                                design: { ...n.data.design, ...designUpdates },
                              },
                            };
                          });
                          setSelectedNode(
                            newNodes.find((n) => n.id === id) || null
                          );
                          setCurrentWorkflow({
                            ...jWorkflow.current,
                            nodes: newNodes,
                          });
                          return newNodes;
                        });
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
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
                    <button
                      className="border semi-text-bg-color px-3 py-1"
                      onClick={() => setIsInputSchemaEditorOpen(true)}
                    >
                      Edit Schema
                    </button>
                    <button
                      className="border semi-text-bg-color px-3 py-1"
                      onClick={() => setIsInputDataEditorOpen(true)}
                    >
                      Edit Data
                    </button>
                  </div>

                  <textarea
                    className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
                    value={(() => {
                      const dataObj = JSON.parse(
                        workflowInputData
                      ) as InputDataset;
                      Object.keys(dataObj).forEach((tableKey) => {
                        const rows = dataObj[tableKey];
                        rows?.forEach((row) => {
                          Object.keys(row).forEach((key) => {
                            const value = row[key];
                            if (!isNaN(Number(value))) row[key] = Number(value);
                            else if (value === "true") row[key] = true;
                            else if (value === "false") row[key] = false;
                          });
                        });
                      });
                      return JSON.stringify(dataObj, null, 2);
                    })()}
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
                    <button
                      className="border semi-text-bg-color px-3 py-1"
                      onClick={() => setIsOutputSchemaEditorOpen(true)}
                    >
                      Edit Schema
                    </button>
                  </div>
                  <textarea
                    className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
                    value={designedOutputData}
                    readOnly
                  />
                </AccordionContent>
              </AccordionItem>
            </div>
          </div>
        </Accordion>

        {/* WorkflowDataModal */}
        {isWorkflowDataModalOpen && workflowId && (
          <WorkflowDataModal
            workflowId={workflowId}
            open={isWorkflowDataModalOpen}
            onClose={() => setIsWorkflowDataModalOpen(false)}
          />
        )}

        <DBConnectionManagerModal
          open={dbConnectionsModalOpen}
          onOpenChange={setDbConnectionsModalOpen}
        />
      </ReactFlowProvider>
    </>
  );
};
