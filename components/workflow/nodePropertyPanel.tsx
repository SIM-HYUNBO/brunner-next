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
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { SqlEditorModal } from "./sqlEditorModal";

import type { ScriptNodeDesignData } from "./types/nodeTypes";
import type { SqlNodeDesignData } from "./types/nodeTypes";

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
}) => {
  const [actionName, setActionName] = useState(node?.data.actionName || "");
  const [inputs, setInputs] = useState<NodeDataTable[]>(
    node?.data.design?.inputs ?? []
  );
  const [outputs, setOutputs] = useState<NodeDataTable[]>(
    node?.data.design?.outputs ?? []
  );

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [localScriptContents, setLocalScript] = useState("");
  const [localScriptTimeoutMs, setLocalTimeoutMs] = useState(5000);

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [sqlModalData, setSqlModalData] = useState<SqlNodeDesignData | null>(
    null
  );
  const [localSqlStmt, setLocalSqlStmt] = useState("");
  const [localDBConnectionId, setLocalDBConnectionId] = useState("");
  const [localSqlMaxRows, setLocalMaxRows] = useState(0);

  const prevActionName = useRef<string>("");
  const { BrunnerMessageBox, openModal } = useModal();
  // 🧠 워크플로우 정보 변경 감지

  useEffect(() => {
    setLocalScript(scriptContents); // prop 변경 시 동기화
  }, [scriptContents]);

  useEffect(() => {
    setLocalTimeoutMs(scriptTimeoutMs); // prop 변경 시 동기화
  }, [scriptTimeoutMs]);

  // 🧠 노드 변경 시 입력/출력 초기화
  useEffect(() => {
    if (!node || node.data.actionName !== constants.workflowActions.SCRIPT)
      return;

    const action = node.data.actionName;
    setActionName(action);

    const defaultInputs = commmonFunctions.getDefaultInputs?.(action) ?? [];
    const defaultOutputs = commmonFunctions.getDefaultOutputs?.(action) ?? [];

    if (prevActionName.current !== action) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
      prevActionName.current = action;
    } else if (
      !node.data.design?.inputs ||
      node.data.design.inputs.length === 0
    ) {
      setInputs(defaultInputs);
      setOutputs(defaultOutputs);
    } else {
      setInputs(node.data.design.inputs);
      setOutputs(node.data.design.outputs);
    }
  }, [
    node?.id,
    node?.data.actionName,
    node?.data.design?.inputs,
    node?.data.design?.outputs,
  ]);

  // 🧠 노드 변경 시 SQL 노드 초기화
  useEffect(() => {
    if (!node || node.data.actionName !== constants.workflowActions.SQL) return;

    const design = node.data.design || {};

    setActionName(node.data.actionName);
    setLocalSqlStmt(design.sqlStmt || "");
    setLocalDBConnectionId(design.dbConnectionId || "");
    setLocalMaxRows(design.maxRows ?? 0);
    setSqlModalData({
      sqlStmt: design.sqlStmt || "",
      dbConnectionId: design.dbConnectionId || "",
      sqlParams: design.sqlParams || [],
      maxRows: design.maxRows ?? 0,
    });
  }, [
    node?.id,
    node?.data.actionName,
    node?.data.design?.sqlStmt,
    node?.data.design?.dbConnectionId,
    node?.data.design?.sqlParams,
    node?.data.design?.maxRows,
  ]);

  const showHelp = () => {
    const apiGuid: string = `
api.log: (...args) => print console log.
api.sleep: (ms) => sleep during miliseconds.
api.alert: (msg) => display alert message.
api.getVar: (path) => get workflow runtime variable value.
api.setVar: (path, value) => set wworkflow runtime variable value.
api.now: () => get current time.
api.timestamp: () => get current time.
api.random: (min, max) => get random number between min to max,
api.clone:(obj) => clone json object,
api.jsonParse: (str) => parse json object.
api.jsonStringify: (obj) => serialize json object.
api.formatDate: (date, fmt) => format date time.
api.postJson: async (url, body) => http post request.
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
    setLocalMaxRows(sqlNodeDesignData.maxRows || 0);

    // ② node.data.design 갱신
    onNodeUpdate?.(node.id, {
      design: {
        ...node.data.design,
        dbConnectionId: sqlNodeDesignData.dbConnectionId,
        sqlStmt: sqlNodeDesignData.sqlStmt,
        sqlParams: sqlNodeDesignData.sqlParams,
        maxRows: sqlNodeDesignData.maxRows,
      },
    });

    // ③ 모달 닫기
    setIsSqlModalOpen(false);
  };

  const BranchNodeProperties = ({ node }: { node: Node<any> }) => {
    if (!node) return null;
    const { data } = node;

    const handleChange = (key: string, value: any) => {
      onNodeUpdate?.(node.id, { [key]: value });
    };

    const isLoopMode = data.mode === constants.workflowBranchNodeMode.Loop;
    const isConditionMode =
      data.mode === constants.workflowBranchNodeMode.Branch;

    return (
      <div className="mt-5">
        <h3>Branch Node Properties</h3>

        <label className="mt-2">Mode</label>
        <select
          className="ml-1 mt-2"
          value={data.mode || "none"}
          onChange={(e) => handleChange("mode", e.target.value)}
        >
          <option value="none">선택하세요</option>
          <option value={constants.workflowBranchNodeMode.Branch}>
            분기 (Branch)
          </option>
          <option value={constants.workflowBranchNodeMode.Loop}>
            반복 (Loop)
          </option>
        </select>

        {isConditionMode && (
          <div className="flex flex-col">
            <label className="mt-2">조건식</label>
            <input
              type="text"
              value={data.condition || ""}
              onChange={(e) => handleChange("condition", e.target.value)}
              placeholder="예: workflow.value > 5"
            />
          </div>
        )}

        {isLoopMode && (
          <div className="flex flex-col">
            <div className="flex flex-row mt-2 space-x-1">
              <label className="">Start</label>
              <input
                className="flex text-center w-full ml-2"
                type="number"
                value={data.startIndex ?? 0}
                onChange={(e) =>
                  handleChange("startIndex", Number(e.target.value))
                }
              />
              <label>Step</label>
              <input
                className="flex text-center w-full ml-2"
                type="number"
                value={data.step ?? 1}
                onChange={(e) => handleChange("step", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-row mt-2">
              <label>Limit</label>
              <input
                className="w-full text-center ml-1"
                type="text"
                value={data.limit ?? ""}
                onChange={(e) => handleChange("limit", e.target.value)}
                placeholder="숫자 또는 ${변수경로}"
              />
            </div>
            <small style={{ color: "#666" }}>
              ※ 예: <code>${"{workflow.items.length}"}</code>
            </small>

            <div style={{ marginTop: 8 }}>
              현재 인덱스: <b>{data.currentIndex ?? data.startIndex ?? 0}</b>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ScriptNodeProperties = ({ node }: { node: Node<any> }) => {
    return (
      <div className="flex flex-col mt-5">
        <h3>Script Node Editor</h3>
        <label>Script Preview:</label>
        <textarea
          readOnly
          value={localScriptContents}
          rows={5}
          className="w-full border p-2 font-mono"
        />
        <div className="flex flex-row space-x-1">
          <button
            className="mt-1 px-3 py-1 border rounded semi-text-bg-color"
            onClick={() => setIsScriptModalOpen(true)}
          >
            Edit Script
          </button>
          <label className="mt-2">Timeout (ms):</label>
          <input
            type="number"
            className="border px-2 py-1 w-[100px]"
            value={localScriptTimeoutMs}
            readOnly
          />
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
          <button
            className="mt-1 px-3 py-1 border rounded semi-text-bg-color"
            onClick={() => {
              setSqlModalData({
                sqlStmt: localSqlStmt,
                dbConnectionId: localDBConnectionId,
                sqlParams: node.data.design?.sqlParams ?? [], // 최신값 보장
                maxRows: localSqlMaxRows,
              });
              setIsSqlModalOpen(true);
            }}
          >
            Edit SQL
          </button>
          <label className="mt-2">Max Rows:</label>
          <input
            type="number"
            className="border px-2 py-1 w-[100px]"
            value={localSqlMaxRows}
            readOnly
          />
        </div>
      </div>
    );
  };

  // 🧩 실제 렌더링
  return (
    <div style={{ padding: 10 }}>
      <BrunnerMessageBox />
      <div className="">
        {/* Node Property Editor */}
        {node && (
          <div>
            <NodePropertyEditor
              node={node}
              nodes={nodes}
              workflowId={workflowId}
              workflowName={workflowName}
              workflowDescription={workflowDescription}
              onNodeUpdate={(id, updates) => {
                onNodeUpdate?.(id, updates);
              }}
            />
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
            initialMaxRows={sqlModalData.maxRows}
            onConfirm={handleSqlModalConfirm}
            onClose={handleSqlModalClose}
          />
        )}
        {node && node.data.actionName === constants.workflowActions.BRANCH && (
          <BranchNodeProperties node={node} />
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
