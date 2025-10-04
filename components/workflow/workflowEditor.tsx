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
      id: constants.workflowActions.START,
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
        },
        run: { inputs: [], outputs: [] },
        script: "",
      },
    },
    {
      id: constants.workflowActions.END,
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
        },
        run: { inputs: [], outputs: [] },
        script: "",
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

  const [workflowInputData, setWorkflowInputData] = useState<string>(
    JSON.stringify({ INPUT_TABLE: [{ key1: "test", key2: 123 }] }, null, 2)
  );

  const initWorkflow = () => {
    setCurrentWorkflow({
      workflowId: uuidv4(),
      workflowName: "new workflow",
      workflowDescription: "new workflow",
      currentNodeId: null,
      data: {
        design: { inputs: [], outputs: [] },
        run: { inputs: [], outputs: [] },
      },
      nodes,
      edges,
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
  const [runningNodeIds, setRunningNodeIds] = useState<string[]>([]);

  const [isInputDataEditorOpen, setIsInputDataEditorOpen] = useState(false);
  const [isInputSchemaEditorOpen, setIsInputSchemaEditorOpen] = useState(false);
  const [isOutputSchemaEditorOpen, setIsOutputSchemaEditorOpen] =
    useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [selectedNodeScript, setSelectedNodeScript] = useState<string>("");

  useEffect(() => {
    setWorkflowId(uuidv4());
    initWorkflow();
  }, []);

  // 선택 노드 변경 시
  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeScript("");
      return;
    }

    if (selectedNode.data.actionName === constants.workflowActions.SCRIPT) {
      setSelectedNodeScript(selectedNode.data.script ?? "");
    } else {
      setSelectedNodeScript(""); // 스크립트 노드가 아니면 초기화
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
          },
          run: { inputs: [], outputs: [] },
          script: "",
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

    // 실행 상태 초기화
    setRunningNodeIds([]);
    stepCounterRef.current = 0;
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

  const deleteWorkflow = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_DELETE_WORKFLOW,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
        workflowId: workflowId,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0) openModal("Successfully delete workflow.");
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
        currentNodeId: null,
        inputs: workflowInputDataObj,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0 && jResponse.jWorkflow)
        setCurrentWorkflow({ ...jResponse.jWorkflow });
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
        currentNodeId: jWorkflow.current?.currentNodeId ?? null,
        inputs: workflowInputDataObj,
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code == 0 && jResponse.jWorkflow)
        setCurrentWorkflow({ ...jResponse.jWorkflow });
    } catch (err) {
      console.error(err);
      openModal("❌ 실행 실패: " + String(err));
    }
  };

  return (
    <>
      <BrunnerMessageBox />
      <ReactFlowProvider>
        <div className="flex flex-row w-full h-full">
          <div className="flex flex-1">
            <ReactFlow
              className="w-full semi-text-bg-color border border-gray-300 rounded-lg shadow-sm"
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
                })) as Edge<any>[]
              }
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              snapToGrid
              snapGrid={[30, 30]}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>

          <DBConnectionManagerModal
            open={dbModalOpen}
            onOpenChange={setDbModalOpen}
          />

          <div className="flex flex-col justify-top h-full">
            <h3>Editor</h3>
            <button
              onClick={() => setDbModalOpen(true)}
              className="px-3 py-1 rounded semi-text-bg-color"
            >
              DB 연결 관리
            </button>
            <button className="w-full border" onClick={addNode}>
              Add Node
            </button>
            <button className="w-full border" onClick={exportWorkflow}>
              Export JSON
            </button>

            <NodePropertyPanel
              workflowId={workflowId}
              workflowName={workflowName}
              workflowDescription={workflowDescription}
              node={selectedNode}
              nodes={nodes}
              script={selectedNodeScript} // 여기 전달
              onWorkflowUpdate={({ workflowName, workflowDescription }) => {
                if (workflowName !== undefined) setWorkflowName(workflowName);
                if (workflowDescription !== undefined)
                  setWorkflowDescription(workflowDescription);
              }}
              onNodeUpdate={(id, updates) => {
                setNodes((nds) => {
                  const newNodes = nds.map((n) =>
                    n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
                  );
                  setSelectedNode(newNodes.find((n) => n.id === id) || null);

                  // workflowData 업데이트
                  const updatedWorkflow = {
                    ...jWorkflow.current,
                    nodes: newNodes,
                  };
                  setCurrentWorkflow(updatedWorkflow);

                  return newNodes;
                });
              }}
            />

            <div className="flex flex-row ml-1 space-x-1">
              <button
                className="w-full semi-text-bg-color border"
                onClick={executeWorkflowFromTableEditor}
              >
                Run
              </button>
              <button
                className="w-full semi-text-bg-color border"
                onClick={executeWorkflowStepByStep}
              >
                Run By Node
              </button>
            </div>

            <WorkflowSelector
              onSelect={(wfSelected: any) => {
                setCurrentWorkflow(wfSelected.workflow_data);
              }}
            />

            <div className="flex flex-row ml-1 mt-1 space-x-1">
              <button
                className="w-full semi-text-bg-color border"
                onClick={saveWorkflow}
              >
                Save
              </button>
              <button
                className="w-full semi-text-bg-color border text-red-700"
                onClick={deleteWorkflow}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row mt-2">
          {/* Input Table */}
          <div className="flex flex-col w-[calc(50%-10px)]">
            <div className="flex flex-row space-x-2">
              <div className="flex flex-row mb-2 space-x-2">
                <h4>Workflow Inputs</h4>
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

              {isInputSchemaEditorOpen && (
                <JsonDatasetEditorModal
                  open={isInputSchemaEditorOpen}
                  mode="schema"
                  value={designedInputData}
                  onConfirm={(newSchema) => {
                    setDesignedInputData(newSchema as DesignedDataset);
                    const newDataObj: Record<string, any> = {};
                    for (const [tableName, rows] of Object.entries(newSchema)) {
                      if (Array.isArray(rows) && rows.length > 0) {
                        const firstRow = rows[0];
                        const newRow: Record<string, any> = {};
                        for (const key in firstRow) {
                          const value = firstRow[key];
                          switch (typeof value) {
                            case "string":
                              newRow[key] = "";
                              break;
                            case "number":
                              newRow[key] = 0;
                              break;
                            case "boolean":
                              newRow[key] = false;
                              break;
                            case "object":
                            default:
                              newRow[key] = {};
                              break;
                          }
                        }
                        newDataObj[tableName] = [newRow];
                      } else {
                        newDataObj[tableName] = [];
                      }
                    }
                    setWorkflowInputData(JSON.stringify(newDataObj, null, 2));
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
            </div>

            <textarea
              className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
              value={(() => {
                const dataObj = JSON.parse(workflowInputData) as InputDataset;
                for (const tableKey of Object.keys(dataObj)) {
                  const rows = dataObj[tableKey];
                  rows?.forEach((row) => {
                    Object.keys(row).forEach((key) => {
                      const value = row[key];
                      if (!isNaN(Number(value))) row[key] = Number(value);
                      else if (value === "true") row[key] = true;
                      else if (value === "false") row[key] = false;
                    });
                  });
                }
                return JSON.stringify(dataObj, null, 2);
              })()}
              readOnly
            />
          </div>

          {/* Output Table */}
          <div className="flex flex-col ml-2 w-[calc(50%-10px)]">
            <div className="flex mb-2">
              <div className="flex flex-row space-x-2">
                <h4>Workflow Outputs</h4>
                <button
                  className="border semi-text-bg-color px-3 py-1"
                  onClick={() => setIsOutputSchemaEditorOpen(true)}
                >
                  Edit Schema
                </button>
              </div>
            </div>
            {isOutputSchemaEditorOpen && (
              <JsonDatasetEditorModal
                open={isOutputSchemaEditorOpen}
                mode="schema"
                value={workflowOutputDataObj}
                onConfirm={(newSchema) => {
                  setDesignedOutputData(JSON.stringify(newSchema, null, 2));
                  setIsOutputSchemaEditorOpen(false);
                }}
                onCancel={() => setIsOutputSchemaEditorOpen(false)}
              />
            )}
            <textarea
              className="w-full h-[200px] mt-2 border p-2 font-mono text-sm"
              value={designedOutputData}
              readOnly
            />
          </div>
        </div>
      </ReactFlowProvider>
    </>
  );
};
