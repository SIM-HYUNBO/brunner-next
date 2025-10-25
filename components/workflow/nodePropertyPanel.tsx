import React, { useState, useEffect, useRef } from "react";
import type { Node } from "reactflow";
import * as constants from "@/components/core/constants";
import { NodePropertyEditor } from "@/components/workflow/nodePropertyEditor";
import { ScriptEditorModal } from "@/components/workflow/scriptEditorModal";
import { SqlEditorModal } from "./sqlEditorModal";
import WorkflowSelectModal from "@/components/workflow/workflowSelectModal";
import { Input, Button } from "antd";
import type {
  ScriptNodeDesignData,
  SqlNodeDesignData,
} from "./types/nodeTypes";

interface NodePropertyPanelProps {
  workflowId: string | null;
  nodes: Node<any>[];
  node: Node<any> | null;
  onNodeUpdate: (id: string, updates: any) => void;
  openModal: (message: string) => void;
}

export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({
  workflowId,
  nodes,
  node,
  onNodeUpdate,
  openModal,
}) => {
  const [localLabel, setLocalLabel] = useState(node?.data.label ?? "");
  const [localScriptContents, setLocalScript] = useState("");
  const [localScriptTimeoutMs, setLocalTimeoutMs] = useState(5000);

  const [localDBConnectionId, setLocalDBConnectionId] = useState("");
  const [localSqlStmt, setLocalSqlStmt] = useState("");
  const [localSqlOutputTableName, setLocalSqlOutputTableName] = useState("");
  const [sqlModalData, setSqlModalData] = useState<SqlNodeDesignData | null>(
    null
  );

  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [workflowSelectModalOpen, setWorkflowSelectModalOpen] = useState(false);

  const prevActionName = useRef<string>("");

  // Node 변경 시 state 초기화
  useEffect(() => {
    if (!node) return;

    setLocalLabel(node.data.label ?? "");

    if (node.data.actionName === constants.workflowActions.SCRIPT) {
      setLocalScript(node.data.design?.scriptContents ?? "");
      setLocalTimeoutMs(node.data.design?.scriptTimeoutMs ?? 5000);
    }

    if (node.data.actionName === constants.workflowActions.SQL) {
      const design = node.data.design || {};
      setLocalDBConnectionId(design.dbConnectionId ?? "");
      setLocalSqlStmt(design.sqlStmt ?? "");
      setLocalSqlOutputTableName(design.outputTableName ?? "");
      setSqlModalData({
        sqlStmt: design.sqlStmt ?? "",
        dbConnectionId: design.dbConnectionId ?? "",
        sqlParams: design.sqlParams ?? [],
        outputTableName: design.outputTableName ?? "",
      });
    }
  }, [node]);

  // 외부 nodes 배열 변경 시
  useEffect(() => {
    if (!node) return;
    const latestNode = nodes.find((n) => n.id === node.id);
    if (!latestNode) return;

    // SCRIPT 동기화
    if (latestNode.data.actionName === constants.workflowActions.SCRIPT) {
      setLocalScript(latestNode.data.design?.scriptContents ?? "");
      setLocalTimeoutMs(latestNode.data.design?.scriptTimeoutMs ?? 5000);
    }

    // SQL 동기화
    if (latestNode.data.actionName === constants.workflowActions.SQL) {
      const design = latestNode.data.design || {};
      setLocalDBConnectionId(design.dbConnectionId ?? "");
      setLocalSqlStmt(design.sqlStmt ?? "");
      setLocalSqlOutputTableName(design.outputTableName ?? "");
      setSqlModalData({
        sqlStmt: design.sqlStmt ?? "",
        dbConnectionId: design.dbConnectionId ?? "",
        sqlParams: design.sqlParams ?? [],
        outputTableName: design.outputTableName ?? "",
      });
    }
  }, [nodes]);

  const handleScriptModalConfirm = (data: ScriptNodeDesignData) => {
    if (!node) return;
    setLocalScript(data.scriptContents ?? "");
    setLocalTimeoutMs(data.scriptTimeoutMs ?? 0);
    onNodeUpdate(node.id, {
      design: {
        ...node.data.design,
        scriptContents: data.scriptContents,
        scriptTimeoutMs: data.scriptTimeoutMs,
      },
    });
    setIsScriptModalOpen(false);
  };

  const handleSqlModalConfirm = (data: SqlNodeDesignData) => {
    if (!node) return;
    setLocalDBConnectionId(data.dbConnectionId ?? "");
    setLocalSqlStmt(data.sqlStmt ?? "");
    setLocalSqlOutputTableName(data.outputTableName ?? "");
    setSqlModalData(data);

    onNodeUpdate(node.id, {
      design: {
        ...node.data.design,
        dbConnectionId: data.dbConnectionId,
        sqlStmt: data.sqlStmt,
        sqlParams: data.sqlParams,
        outputTableName: data.outputTableName,
      },
    });

    setIsSqlModalOpen(false);
  };

  // Branch Node
  const BranchNodeProperties = ({ node }: { node: Node<any> }) => {
    const [mode, setMode] = useState(node.data.design?.mode ?? "Branch");
    const [condition, setCondition] = useState(
      node.data.design?.condition ?? ""
    );
    const [loopStartValue, setLoopStartValue] = useState(
      node.data.design?.loopStartValue ?? 0
    );
    const [loopStepValue, setLoopStepValue] = useState(
      node.data.design?.loopStepValue ?? 1
    );
    const [loopLimitValue, setLoopLimitValue] = useState(
      node.data.design?.loopLimitValue ?? ""
    );
    const loopCurrentValue = node.data.design?.loopCurrentValue ?? 0;

    useEffect(() => {
      setMode(node.data.design?.mode ?? "Branch");
      setCondition(node.data.design?.condition ?? "");
      setLoopStartValue(node.data.design?.loopStartValue ?? 0);
      setLoopStepValue(node.data.design?.loopStepValue ?? 1);
      setLoopLimitValue(node.data.design?.loopLimitValue ?? "");
    }, [node]);

    const handleBranchNodeChange = (key: string, value: any) => {
      let newDesign;

      if (key === "mode") {
        // 모드가 변경된 경우: 디자인 초기화
        if (value === "Branch") {
          newDesign = {
            mode: "Branch",
            condition: "",
          };
        } else if (value === "Loop") {
          newDesign = {
            mode: "Loop",
            loopStartValue: 0,
            loopStepValue: 1,
            loopLimitValue: "",
            loopCurrentValue: 0,
          };
        }
      } else {
        // 일반 변경
        newDesign = { ...node.data.design, [key]: value };
      }

      onNodeUpdate(node.id, { design: newDesign });
    };

    return (
      <div className="border p-3 rounded shadow-sm semi-text-bg-color mt-4">
        <h3 className="font-semibold mb-2">Branch Node</h3>
        <div className="flex items-center space-x-2 mb-2">
          <label>Mode:</label>
          <select
            className="w-1/2 text-center"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              handleBranchNodeChange("mode", e.target.value);
            }}
          >
            <option value="Branch">Branch</option>
            <option value="Loop">Loop</option>
          </select>
        </div>

        {mode === "Branch" && (
          <div className="flex flex-col mb-2">
            <label>Condition:</label>
            <textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              onBlur={() => handleBranchNodeChange("condition", condition)}
              rows={3}
            />
          </div>
        )}

        {mode === "Loop" && (
          <div className="flex flex-col mb-2">
            <div className="flex space-x-2 mt-1 mb-1">
              <label>Start:</label>
              <input
                type="number"
                value={loopStartValue}
                onChange={(e) => setLoopStartValue(Number(e.target.value))}
                onBlur={() =>
                  handleBranchNodeChange("loopStartValue", loopStartValue)
                }
              />
              <label>Step:</label>
              <input
                type="number"
                value={loopStepValue}
                onChange={(e) => setLoopStepValue(Number(e.target.value))}
                onBlur={() =>
                  handleBranchNodeChange("loopStepValue", loopStepValue)
                }
              />
            </div>
            <label className="mt-1">Limit:</label>
            <textarea
              className="mt-1"
              value={loopLimitValue}
              onChange={(e) => setLoopLimitValue(e.target.value)}
              onBlur={() =>
                handleBranchNodeChange("loopLimitValue", loopLimitValue)
              }
              rows={2}
            />
            <div className="mt-1">Current Index: {loopCurrentValue}</div>
          </div>
        )}
      </div>
    );
  };

  const ScriptNodeProperties = ({ node }: { node: Node<any> }) => {
    return (
      <div className="border p-3 rounded shadow-sm semi-text-bg-color mt-4">
        <h3 className="font-semibold mb-2">Script Node</h3>
        <textarea
          readOnly
          value={localScriptContents}
          rows={5}
          className="w-full border rounded px-2 py-1 mb-2"
        />
        <div className="flex items-center space-x-2">
          <label>Timeout (ms):</label>
          <input
            type="number"
            readOnly
            value={localScriptTimeoutMs}
            className="border rounded px-2 py-1 w-[80px] text-center"
          />
          <Button onClick={() => setIsScriptModalOpen(true)}>
            Edit Script
          </Button>
        </div>
      </div>
    );
  };

  const SqlNodeProperties = ({ node }: { node: Node<any> }) => {
    return (
      <div className="border p-3 rounded shadow-sm semi-text-bg-color mt-4">
        <h3 className="font-semibold mb-2">SQL Node</h3>
        <label>Database:</label>
        <input
          type="text"
          readOnly
          value={localDBConnectionId}
          className="w-full border rounded px-2 py-1 mb-2"
        />
        <label>SQL Statement:</label>
        <textarea
          readOnly
          value={localSqlStmt}
          rows={5}
          className="w-full border rounded px-2 py-1 mb-2 font-mono"
        />
        <label>Output Table:</label>
        <input
          type="text"
          readOnly
          value={localSqlOutputTableName}
          className="w-full border rounded px-2 py-1 mb-2"
        />
        <Button
          onClick={() => {
            setSqlModalData({
              sqlStmt: localSqlStmt,
              dbConnectionId: localDBConnectionId,
              sqlParams: node.data.design?.sqlParams ?? [],
              outputTableName: localSqlOutputTableName,
            });
            setIsSqlModalOpen(true);
          }}
        >
          Edit SQL
        </Button>
      </div>
    );
  };

  const CallNodeProperties = ({ node }: { node: Node<any> }) => {
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(
      node.data.design?.targetWorkflowId ?? ""
    );
    const handleSelectWorkflow = (workflow: any) => {
      if (workflow.id === workflowId) {
        openModal(constants.messages.WORKFLOW_INVALID_SELF_CALL);
        return;
      }
      setSelectedWorkflowId(workflow.id);
      onNodeUpdate(node.id, {
        design: {
          ...node.data.design,
          targetWorkflowId: workflow.id,
          targetWorkflowName: workflow.workflow_data.workflowName,
        },
      });
    };

    return (
      <div className="border p-3 rounded shadow-sm semi-text-bg-color mt-4">
        <h3 className="font-semibold mb-2">Call Node</h3>
        <Button onClick={() => setWorkflowSelectModalOpen(true)}>
          Select Workflow...
        </Button>
        <div>Selected Workflow: {selectedWorkflowId}</div>
        <WorkflowSelectModal
          open={workflowSelectModalOpen}
          onClose={() => setWorkflowSelectModalOpen(false)}
          onSelect={handleSelectWorkflow}
        />
      </div>
    );
  };

  if (!node)
    return (
      <div className="p-4 semi-text-bg-color">
        Select a node to see its properties.
      </div>
    );

  return (
    <div className="w-full max-w-[450px] p-4 space-y-4 semi-text-bg-color">
      {/* NodePropertyEditor */}
      <NodePropertyEditor
        node={node}
        onNodeUpdate={onNodeUpdate}
        openModal={openModal}
      />

      {/* Label Editor */}
      <div className="flex flex-row border p-3 rounded shadow-sm semi-text-bg-color">
        <label className="block font-semibold mb-1">Label:</label>
        <input
          type="text"
          value={localLabel}
          onChange={(e) => {
            const v = e.target.value;
            setLocalLabel(v);
            onNodeUpdate(node.id, { data: { ...node.data, label: v } });
          }}
          className="flex flex-1 w-full border rounded ml-2 px-2 py-1"
        />
      </div>

      {/* Node type-specific */}
      {node.data.actionName === constants.workflowActions.SCRIPT && (
        <ScriptNodeProperties node={node} />
      )}
      {node.data.actionName === constants.workflowActions.SQL && (
        <SqlNodeProperties node={node} />
      )}
      {node.data.actionName === constants.workflowActions.BRANCH && (
        <BranchNodeProperties node={node} />
      )}
      {node.data.actionName === constants.workflowActions.CALL && (
        <CallNodeProperties node={node} />
      )}

      {/* Modals */}
      {isScriptModalOpen && (
        <ScriptEditorModal
          open={isScriptModalOpen}
          scriptContents={localScriptContents}
          scriptTimeoutMs={localScriptTimeoutMs}
          onConfirm={handleScriptModalConfirm}
          onClose={() => setIsScriptModalOpen(false)}
          onHelp={() => openModal("Script API Help")}
        />
      )}
      {isSqlModalOpen && sqlModalData && (
        <SqlEditorModal
          open={isSqlModalOpen}
          initialDbConnectionId={sqlModalData.dbConnectionId}
          initialSqlStmt={sqlModalData.sqlStmt}
          initialParams={sqlModalData.sqlParams}
          initialOutputTableName={sqlModalData.outputTableName}
          onConfirm={handleSqlModalConfirm}
          onClose={() => setIsSqlModalOpen(false)}
        />
      )}
    </div>
  );
};
