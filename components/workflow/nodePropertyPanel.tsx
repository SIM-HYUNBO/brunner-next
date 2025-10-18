import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import type {
  NodeDataTable,
  DatasetColumn,
} from "@/components/core/commonData";
import * as commmonFunctions from "@/components/core/commonFunctions";
import * as constants from "@/components/core/constants";
import { JsonDatasetEditorModal } from "@/components/workflow/jsonDatasetEditorModal";
import type { JsonColumnType } from "@/components/workflow/jsonDatasetEditorModal";
import { NodePropertyEditor } from "@/components/workflow/nodePropertyEditor";
import { ScriptEditorModal } from "@/components/workflow/scriptEditorModal";
import { SqlEditorModal } from "./sqlEditorModal";
import WorkflowSelectModal from "@/components/workflow/workflowSelectModal";

import type { ScriptNodeDesignData } from "./types/nodeTypes";
import type { SqlNodeDesignData } from "./types/nodeTypes";
import { Input, Button, Table } from "antd";

interface NodePropertyPanelProps {
  node: Node<any> | null;
  nodes: Node<any>[];
  scriptContents: string;
  scriptTimeoutMs: number | 5000;
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  onWorkflowUpdate?: (updates: {
    workflowId?: string;
    workflowName?: string;
    workflowDescription?: string;
  }) => void;
  onNodeUpdate?: (id: string, updates: any) => void;
  openModal: (message: string) => void;
}

export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({
  node,
  nodes,
  scriptContents,
  scriptTimeoutMs,
  workflowId,
  workflowName,
  workflowDescription,
  onWorkflowUpdate,
  onNodeUpdate,
  openModal,
}) => {
  const [actionName, setActionName] = useState(node?.data.actionName || "");

  // Inputs /Outputs
  const [inputs, setInputs] = useState<NodeDataTable[]>(
    node?.data.design?.inputs ?? []
  );
  const [outputs, setOutputs] = useState<NodeDataTable[]>(
    node?.data.design?.outputs ?? []
  );
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  const [localLabel, setLocalLabel] = useState(node?.data.label ?? "");

  // SCRIPT 노드
  const [localScriptContents, setLocalScript] = useState("");
  const [localScriptTimeoutMs, setLocalTimeoutMs] = useState(5000);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);

  // SQL 노드
  const [localSqlStmt, setLocalSqlStmt] = useState("");
  const [localDBConnectionId, setLocalDBConnectionId] = useState("");
  const [localSqlOutputTableName, setLocalSqlOutputTableName] = useState("");
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlModalData, setSqlModalData] = useState<SqlNodeDesignData | null>(
    null
  );

  // CALL 노드
  const [workflowSelectModalOpen, setWorkflowSelectModalOpen] = useState(false);

  const prevActionName = useRef<string>("");

  const [loopCurrentIndex, setCurrentIndex] = useState(
    node?.data.design?.loopCurrentIndex ?? 0
  );

  // 🧠 워크플로우 정보 변경 감지

  useEffect(() => {
    setLocalScript(scriptContents); // prop 변경 시 동기화
  }, [scriptContents]);

  useEffect(() => {
    setLocalTimeoutMs(scriptTimeoutMs); // prop 변경 시 동기화
  }, [scriptTimeoutMs]);

  useEffect(() => {
    setCurrentIndex(node?.data.design?.loopCurrentIndex ?? 0);
  }, [node?.data.design?.loopCurrentIndex]);

  // 🧠 노드 변경 시 입력/출력 초기화
  useEffect(() => {
    if (!node) return;

    setLocalLabel(node.data.label);
    setActionName(node.data.actionName);

    const defaultInputs =
      commmonFunctions.getDefaultInputs?.(node.data.actionName) ?? [];
    const defaultOutputs =
      commmonFunctions.getDefaultOutputs?.(node.data.actionName) ?? [];

    if (
      prevActionName.current !== node.data.actionName ||
      !node.data.design?.inputs ||
      node.data.design.inputs.length === 0
    ) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
      prevActionName.current = node.data.actionName;
    } else {
      setInputs(node.data.design.inputs);
      setOutputs(node.data.design.outputs);
    }
  }, [
    node?.id,
    node?.data.label,
    node?.data.actionName,
    node?.data.design?.inputs,
    node?.data.design?.outputs,
  ]);

  // 🧠 노드 변경 시 SQL 노드 초기화
  useEffect(() => {
    if (node?.data?.actionName == constants.workflowActions.SQL) {
      const design = node.data.design || {};

      setActionName(node.data.actionName);

      setLocalSqlStmt(design.sqlStmt || "");
      setLocalDBConnectionId(design.dbConnectionId || "");
      // setLocalMaxRows(design.maxRows ?? 0);
      setLocalSqlOutputTableName(design.outputTableName ?? "");
      setSqlModalData({
        sqlStmt: design.sqlStmt || "",
        dbConnectionId: design.dbConnectionId || "",
        sqlParams: design.sqlParams || [],
        // maxRows: design.maxRows ?? 0,
        outputTableName: design.outputTableName ?? "",
      });
    }
  }, [
    node?.id,
    node?.data.actionName,
    node?.data.design?.sqlStmt,
    node?.data.design?.dbConnectionId,
    node?.data.design?.sqlParams,
    // node?.data.design?.maxRows,
    node?.data.design?.outputTableName,
  ]);

  // ✅ 외부 nodes 배열이 바뀌면, 현재 node.id 에 해당하는 최신 데이터를 반영
  useEffect(() => {
    if (!node) return;
    const latestNode = nodes.find((n) => n.id === node.id);
    if (!latestNode) return;

    // inputs / outputs 동기화
    setInputs(latestNode.data.design?.inputs ?? []);
    setOutputs(latestNode.data.design?.outputs ?? []);

    // loopCurrentIndex 갱신
    setCurrentIndex(
      latestNode.data.run?.currentIndex ??
        latestNode.data.design?.loopCurrentIndex ??
        0
    );

    // SCRIPT 노드
    if (latestNode.data.actionName === constants.workflowActions.SCRIPT) {
      setLocalScript(latestNode.data.design?.scriptContents ?? "");
      setLocalTimeoutMs(latestNode.data.design?.scriptTimeoutMs ?? 5000);
    }

    // SQL 노드
    if (latestNode.data.actionName === constants.workflowActions.SQL) {
      const design = latestNode.data.design || {};
      setLocalSqlStmt(design.sqlStmt ?? "");
      setLocalDBConnectionId(design.dbConnectionId ?? "");
      // setLocalMaxRows(d.maxRows ?? 0);
      setLocalSqlOutputTableName(design.outputTableName);
      setSqlModalData({
        sqlStmt: design.sqlStmt ?? "",
        dbConnectionId: design.dbConnectionId ?? "",
        sqlParams: design.sqlParams ?? [],
        // maxRows: d.maxRows ?? 0,
        outputTableName: design.outputTableName ?? "",
      });
    }
  }, [nodes]);

  const showHelp = () => {
    const apiGuid: string = `
        clone: (obj: any): any => JSON.parse(JSON.stringify(obj)),
        error: (message: any) => safeApi.log(message, "error"),
        formatDate: (date: Date, fmt: string): string => date.toISOString(),
        jsonParse: (str: string): any => JSON.parse(str),
        jsonStringify: (obj: any): string => JSON.stringify(obj),
        getGlobalVar: (path: string) => getByPath(workflowData, path),
        getVar: (path: string) => getByPath(node, path),
        info: (message: any) => safeApi.log(message, "info"),
        log: (message: any, level: "info" | "warn" | "error" = "info"),
        now: (): Date => new Date(),
        postJson: async (url: string, body: any): Promise<any>,
        random: (min: number = 0, max: number = 1): number,
        sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
        setGlobalVar: (path: string, value: any),
        setVar: (path: string, value: any) => setByPath(node, path, value),
        sql: async (connectionId: string, sql: string, params?: any[]),
        timestamp: (): number => Date.now(),
        warn: (message: any) => safeApi.log(message, "warn"),
    `;
    openModal(apiGuid);
  };

  // 🧩 유틸: 컬럼 타입 추론
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

  // 🧩 컬럼 타입 정규화
  const normalizeColumnType = (type: string): DatasetColumn["type"] => {
    return ["string", "number", "boolean"].includes(type)
      ? (type as DatasetColumn["type"])
      : "string";
  };

  const handleSqlModalClose = () => {
    setIsSqlModalOpen(false);
  };

  const handleScriptModalConfirm = (data: ScriptNodeDesignData) => {
    if (!node) return;
    setLocalScript(data.scriptContents ?? "");
    setLocalTimeoutMs(data.scriptTimeoutMs ?? 0);
    onNodeUpdate?.(node.id, {
      design: {
        // 스크립트 노드 정보
        scriptContents: data.scriptContents,
        scriptTimeoutMs: data.scriptTimeoutMs,
      },
    });
    setIsScriptModalOpen(false);
  };

  const handleSqlModalConfirm = (sqlNodeDesignData: SqlNodeDesignData) => {
    if (!node) return;
    console.log("SQL Editor 저장:", sqlNodeDesignData);

    // ① 모달 내부 값 state 저장 (옵션)
    setSqlModalData(sqlNodeDesignData);
    setLocalSqlStmt(sqlNodeDesignData.sqlStmt || "");
    setLocalDBConnectionId(sqlNodeDesignData.dbConnectionId || "");
    // setLocalMaxRows(sqlNodeDesignData.maxRows || 0);
    setLocalSqlOutputTableName(sqlNodeDesignData.outputTableName || "");

    // ② node.data.design 갱신
    onNodeUpdate?.(node.id, {
      design: {
        ...node.data.design,
        dbConnectionId: sqlNodeDesignData.dbConnectionId,
        sqlStmt: sqlNodeDesignData.sqlStmt,
        sqlParams: sqlNodeDesignData.sqlParams,
        // maxRows: sqlNodeDesignData.maxRows,
        outputTableName: sqlNodeDesignData.outputTableName,
      },
    });

    // ③ 모달 닫기
    setIsSqlModalOpen(false);
  };

  const BranchNodeProperties = ({ node }: { node: Node<any> }) => {
    if (!node) return null;
    const { data } = node;
    const [localCondition, setLocalCondition] = useState(
      data.design?.condition || ""
    );
    const [localLoopStartIndex, setLocalLoopStartIndex] = useState(
      data.design?.loopStartIndex ?? 0
    );
    const [localLoopStepValue, setLocalLoopStepValue] = useState(
      data.design?.loopStepValue ?? 1
    );
    const [localLoopLimitValue, setLocalLoopLimitValue] = useState(
      data.design?.loopLimitValue ?? ""
    );

    useEffect(() => {
      setLocalCondition(data.design?.condition ?? "");
      setLocalLoopStartIndex(data.design?.loopStartIndex ?? 0);
      setLocalLoopStepValue(data.design?.loopStepValue ?? 1);
      setLocalLoopLimitValue(data.design?.loopLimitValue ?? "");
    }, [data.design]);

    // ✅ design 안에 안전하게 저장
    const handleBranchNodeChange = (
      key: keyof typeof node.data.design,
      value: any,
      isModeChange = false
    ) => {
      let newDesign;

      isModeChange = key === "mode";

      if (isModeChange) {
        // 모드 변경 시: 화면상의 값 기반으로 완전히 새 design 생성
        newDesign = {
          mode: value, // 변경된 모드
          loopStartIndex: node.data.design.loopStartIndex,
          loopStepValue: node.data.design.loopStepValue,
          loopLimitValue: node.data.design.loopLimitValue,
          condition: node.data.design.condition,
          loopCurrentIndex: node.data.design.loopCurrentIndex,
        };
      } else {
        // 단순 값 변경 시: 기존 design에 변경 값만 덮어쓰기
        newDesign = {
          ...node.data.design,
          [key]: value,
        };
      }

      // 업데이트
      onNodeUpdate?.(node.id, { design: newDesign });
    };

    const isLoopMode =
      data.design?.mode === constants.workflowBranchNodeMode.Loop;
    const isConditionMode =
      data.design?.mode === constants.workflowBranchNodeMode.Branch;

    return (
      <div className="mt-5 flex flex-col">
        <h3>Branch Node Properties</h3>
        <div className="flex flex-row space-x-1">
          <label className="mt-2">Mode</label>
          <select
            className="ml-1 mt-2 flex-1 text-center"
            value={data.design?.mode || "none"}
            onChange={(e) => handleBranchNodeChange("mode", e.target.value)}
          >
            <option value="none">선택하세요</option>
            <option value={constants.workflowBranchNodeMode.Branch}>
              분기 (Branch)
            </option>
            <option value={constants.workflowBranchNodeMode.Loop}>
              반복 (Loop)
            </option>
          </select>
        </div>

        {isConditionMode && (
          <div className="flex flex-col">
            <label className="mt-2">Condition Expression</label>
            <textarea
              value={localCondition} // ✅ 로컬 상태 사용
              onChange={(e) => setLocalCondition(e.target.value)} // ✅ 타이핑 시 로컬 상태만 변경
              onBlur={() => handleBranchNodeChange("condition", localCondition)} // ✅ 포커스 떠날 때 부모에 저장
              placeholder="예: workflow.value > 5"
            />
          </div>
        )}

        {isLoopMode && (
          <div className="flex flex-col">
            <div className="flex flex-row mt-2 space-x-3">
              <label>Start</label>
              <input
                className="flex text-center w-full ml-2"
                type="number"
                value={localLoopStartIndex}
                onChange={(e) => setLocalLoopStartIndex(Number(e.target.value))}
                onBlur={() =>
                  handleBranchNodeChange("loopStartIndex", localLoopStartIndex)
                }
              />
              <label>Step</label>
              <input
                className="flex text-center w-full ml-2"
                type="number"
                value={localLoopStepValue}
                onChange={(e) => setLocalLoopStepValue(Number(e.target.value))}
                onBlur={() =>
                  handleBranchNodeChange("loopStepValue", localLoopStepValue)
                }
              />
            </div>

            <div className="flex flex-col mt-2">
              <label>Limit</label>
              <textarea
                className="w-full h-full text-left"
                value={localLoopLimitValue}
                rows={3}
                onChange={(e) => setLocalLoopLimitValue(e.target.value)}
                onBlur={() =>
                  handleBranchNodeChange("loopLimitValue", localLoopLimitValue)
                }
                placeholder="숫자 또는 JS 표현식 입력"
              />
            </div>
            <small className="w-full text-center semi-text-bg-color">
              ※ Ex) <code>${"{workflow.items.length}"}</code>
            </small>

            <div style={{ marginTop: 8 }}>
              Current Index : <b>{loopCurrentIndex}</b>
            </div>
            <small className="w-full text-center semi-text-bg-color">
              ※ (Start ≤ Current &lt; Limit)
            </small>
          </div>
        )}
      </div>
    );
  };

  const ScriptNodeProperties = ({ node }: { node: Node<any> }) => {
    return (
      <div className="flex flex-col mt-5">
        <h3>Script Node Editor</h3>
        <label className="mt-2">Script Preview:</label>
        <textarea
          readOnly
          value={localScriptContents}
          rows={5}
          className="w-full border p-2 mt-1"
        />
        <div className="flex flex-col mt-2">
          <div className="flex space-x-2 mt-2">
            <label className="border">Timeout (ms):</label>
            <input
              type="number"
              className="border w-[50px] text-center"
              value={localScriptTimeoutMs}
              readOnly
            />
          </div>
          <Button
            className="border rounded medium-text-bg-color mt-2 px-2 w-[100px]"
            onClick={() => setIsScriptModalOpen(true)}
          >
            Edit Script
          </Button>
        </div>
      </div>
    );
  };

  const SqlNodeProperties = ({ node }: { node: Node<any> }) => {
    return (
      <div className="flex flex-col mt-5">
        <h3>Sql Node Editor</h3>
        <label className="mt-2">Database:</label>
        <input
          type="text"
          className="border px-2 py-1 w-full"
          value={localDBConnectionId}
          readOnly
        />
        <label>Sql Preview:</label>
        <textarea
          readOnly
          value={localSqlStmt}
          rows={5}
          className="w-full border p-2 font-mono"
        />
        <div className="flex flex-row space-x-1">
          <Button
            className="mt-1 px-3 py-1 border rounded semi-text-bg-color"
            onClick={() => {
              setSqlModalData({
                sqlStmt: localSqlStmt,
                dbConnectionId: localDBConnectionId,
                sqlParams: node.data.design?.sqlParams ?? [], // 최신값 보장
                // maxRows: localSqlMaxRows,
                outputTableName: localSqlOutputTableName,
              });
              setIsSqlModalOpen(true);
            }}
          >
            Edit Sql
          </Button>
          <div className="flex flex-col">
            {/* <div className="flex flex-row mt-1">
              <label className="mt-2">Max Rows</label>
              <input
                type="number"
                className="border px-2 py-1 w-[100px]"
                value={localSqlMaxRows}
                readOnly
              />
            </div> */}
            <div className="flex flex-row mt-2"></div>
            <label>Output Table</label>
            <input
              type="text"
              className="border px-1 py-1"
              value={localSqlOutputTableName}
              readOnly
            />
          </div>
        </div>
      </div>
    );
  };

  const CallNodeProperties = ({ node, onNodeUpdate }: any) => {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
      node.data.design?.targetWorkflowId || ""
    );

    const handleSelectWorkflow = (workflow: any) => {
      if (workflow.id === workflowId) {
        openModal(constants.messages.WORKFLOW_INVALID_SELF_CALL);
      }

      setSelectedWorkflowId(workflow.id);
      onNodeUpdate?.(node.id, {
        design: {
          ...node.data.design,
          targetWorkflowId: workflow.id,
          targetWorkflowName: workflow.workflow_data.workflowName,
        },
      });
    };

    return (
      <>
        <Button
          onClick={() => setWorkflowSelectModalOpen(true)}
          className="p-2 rounded-md medium-text-bg-color"
        >
          Select ...
        </Button>
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-sm font-semibold">
            Target Workflow: {selectedWorkflowId}
          </label>
          {/* 워크플로우 선택 모달 */}
          <WorkflowSelectModal
            open={workflowSelectModalOpen}
            onClose={() => setWorkflowSelectModalOpen(false)}
            onSelect={handleSelectWorkflow}
          />
        </div>
      </>
    );
  };

  // 🧩 실제 렌더링
  return (
    <div className="w-auto">
      <div className="">
        {/* Node Property Editor */}
        {node && (
          <div>
            <NodePropertyEditor
              node={node}
              onNodeUpdate={(id, updates) => {
                onNodeUpdate?.(id, updates);
              }}
              openModal={openModal}
            />
            {/* 🏷️ Node Label Editor */}
            {node && (
              <div className="my-4">
                <label className="block text-sm mb-1">Label</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  value={localLabel}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalLabel(v); // UI 즉시 반영

                    // 부모에 안전하게 현재 data 전체를 포함해서 보냄
                    onNodeUpdate?.(node.id, {
                      data: {
                        ...(node.data ?? {}),
                        label: v,
                      },
                    });
                  }}
                  placeholder="노드 이름을 입력하세요"
                />
              </div>
            )}
          </div>
        )}
        {node && node.data.actionName === constants.workflowActions.SCRIPT && (
          <ScriptNodeProperties node={node} />
        )}
        {isScriptModalOpen && (
          <ScriptEditorModal
            open={isScriptModalOpen}
            scriptContents={localScriptContents}
            scriptTimeoutMs={localScriptTimeoutMs}
            onConfirm={handleScriptModalConfirm}
            onClose={() => setIsScriptModalOpen(false)}
            onHelp={() => showHelp()}
          />
        )}
        {node && node.data.actionName === constants.workflowActions.SQL && (
          <SqlNodeProperties node={node} />
        )}
        {isSqlModalOpen && sqlModalData && (
          <SqlEditorModal
            open={isSqlModalOpen}
            initialDbConnectionId={sqlModalData.dbConnectionId}
            initialSqlStmt={sqlModalData.sqlStmt}
            initialParams={sqlModalData.sqlParams}
            // initialMaxRows={sqlModalData.maxRows}
            initialOutputTableName={sqlModalData.outputTableName}
            onConfirm={handleSqlModalConfirm}
            onClose={handleSqlModalClose}
          />
        )}
        {node && node.data.actionName === constants.workflowActions.BRANCH && (
          <BranchNodeProperties node={node} />
        )}
        {node && node.data.actionName === constants.workflowActions.CALL && (
          <CallNodeProperties node={node} onNodeUpdate={onNodeUpdate} />
        )}
      </div>

      {/* ✅ Input Modal */}
      {isInputModalOpen && (
        <JsonDatasetEditorModal
          open={isInputModalOpen}
          mode="schema"
          value={inputs.reduce((acc, table) => {
            acc[table.table] = table.columns.map((col) => ({
              key: col.key,
              type: col.type as JsonColumnType,
            }));
            return acc;
          }, {} as Record<string, DatasetColumn[]>)}
          onConfirm={(newSchema) => {
            const newInputsArray: NodeDataTable[] = Object.entries(
              newSchema
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));

            setInputs(newInputsArray);
            setIsInputModalOpen(false);

            if (node)
              onNodeUpdate?.(node.id, {
                design: { inputs: newInputsArray, outputs },
              });
          }}
          onCancel={() => setIsInputModalOpen(false)}
        />
      )}

      {/* ✅ Output Modal */}
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
            ).map(([table, data]) => ({
              table,
              columns: inferColumns(data),
              rows: Array.isArray(data) ? data : [],
            }));

            setOutputs(newOutputsArray);
            setIsOutputModalOpen(false);

            if (node)
              onNodeUpdate?.(node.id, {
                design: { inputs, outputs: newOutputsArray },
              });
          }}
          onCancel={() => setIsOutputModalOpen(false)}
        />
      )}
    </div>
  );
};
