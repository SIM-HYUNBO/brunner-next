// components/workflow/SqlEditorModal.tsx
import React, { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { Input, Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SqlParam, SqlNodeDesignData } from "./types/nodeTypes";
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";
import * as constants from "@/components/core/constants";

interface SqlEditorModalProps {
  open: boolean;
  initialDbConnectionId?: string | undefined;
  initialSqlStmt?: string | undefined;
  initialParams?: SqlParam[] | undefined;
  // initialMaxRows?: number | undefined;
  initialOutputTableName?: string | undefined;
  onConfirm: (result: SqlNodeDesignData) => void;
  onClose: () => void;
}

export const SqlEditorModal: React.FC<SqlEditorModalProps> = ({
  open,
  initialDbConnectionId = constants.General.EmptyString,
  initialSqlStmt = constants.General.EmptyString,
  initialParams = [],
  // initialMaxRows,
  initialOutputTableName = constants.General.EmptyString,
  onConfirm,
  onClose,
}) => {
  const [sqlStmt, setSqlStmt] = useState(initialSqlStmt);
  const [params, setParams] = useState<SqlParam[]>(initialParams);
  // const [maxRows, setMaxRows] = useState<number | undefined>(initialMaxRows);
  const [dbConnectionId, setDbConnectionId] = useState(initialDbConnectionId);
  const [outputTableName, setOutputTableName] = useState<string | undefined>(
    initialOutputTableName
  );

  // sliding panel
  const [showParamsPanel, setShowParamsPanel] = useState(true);
  const [panelWidth, setPanelWidth] = useState(300);
  const panelResizing = useRef(false);
  const lastX = useRef(0);

  // drag/resize modal
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(520);
  const [position, setPosition] = useState({
    x: (window?.innerWidth - width) / 2,
    y: (window?.innerHeight - height) / 2,
  });
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // sync props
  useEffect(() => {
    setDbConnectionId(initialDbConnectionId);
    setSqlStmt(initialSqlStmt);
    setParams(initialParams);
    // setMaxRows(initialMaxRows);
    setOutputTableName(initialOutputTableName);
  }, [
    initialDbConnectionId,
    initialSqlStmt,
    initialParams,
    // initialMaxRows,
    initialOutputTableName,
  ]);

  // global mouse handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setPosition((p) => ({ x: p.x + dx, y: p.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
      } else if (isResizing.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setWidth((w) => Math.max(600, w + dx));
        setHeight((h) => Math.max(360, h + dy));
        lastPos.current = { x: e.clientX, y: e.clientY };
      } else if (panelResizing.current) {
        const dx = lastX.current - e.clientX;
        setPanelWidth((w) => Math.max(200, w + dx));
        lastX.current = e.clientX;
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
      panelResizing.current = false;
      document.body.style.userSelect = constants.General.EmptyString;
    };

    if (!window) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!open) return null;

  const columns: ColumnsType<SqlParam> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (val) => <span>{val ?? "(unnamed)"}</span>,
    },
    {
      title: "${Path} or Value",
      dataIndex: "binding",
      key: "binding",
      render: (_, rec, idx) => {
        const displayValue =
          rec.binding ?? rec.value ?? constants.General.EmptyString;
        return (
          <input
            className="w-full general-text-bg-color border rounded px-2 py-1"
            value={displayValue}
            placeholder="변수 경로 {{userId}} 또는 값 123"
            onChange={(e) =>
              setParams((prev) =>
                prev.map((p, i) => {
                  if (i !== idx) return p;
                  const val = e.target.value;
                  const isVar = /\{\{.*\}\}|\$\{.*\}/.test(val);
                  return {
                    ...p,
                    binding: isVar ? val : undefined,
                    value: isVar ? p.value : val,
                  };
                })
              )
            }
          />
        );
      },
    },
    {
      title: "Delete",
      key: "delete",
      render: (_, __, idx) => (
        <Button
          className="px-2 py-1 text-sm rounded bg-red-500 text-white"
          onClick={() => setParams((prev) => prev.filter((_, i) => i !== idx))}
        >
          Del.
        </Button>
      ),
    },
  ];

  const handleSave = () => {
    const out: SqlNodeDesignData = {
      dbConnectionId,
      sqlStmt,
      sqlParams: params.map((p) => {
        const isVar = /\{\{.*\}\}|\$\{.*\}/.test(
          p.binding ?? constants.General.EmptyString
        );
        return {
          ...p,
          value: isVar ? undefined : p.value,
          binding: isVar ? p.binding : undefined,
        };
      }),
      // maxRows: maxRows && maxRows > 0 ? maxRows : undefined,
      outputTableName,
    };
    onConfirm(out);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={dragRef}
        className="absolute semi-text-bg-color rounded shadow-lg flex flex-col"
        style={{
          left: position.x,
          top: position.y,
          width,
          height,
          minWidth: 600,
          minHeight: 360,
        }}
      >
        {/* 타이틀 바 */}
        <div
          className="flex medium-text-bg-color items-center justify-between p-2 cursor-move select-none"
          onMouseDown={(e) => {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none";
          }}
        >
          <h3 className="font-semibold">SQL Editor</h3>
          <div className="flex gap-2">
            <Button
              className="px-2 py-1 border rounded text-sm general-text-bg-color"
              onClick={() => setShowParamsPanel((s) => !s)}
            >
              {showParamsPanel ? "Hide params." : "View params"}
            </Button>
          </div>
        </div>

        {/* 상단 입력 */}
        <div className="flex gap-4 p-3 border-b">
          <div className="flex flex-col">
            <label>DB Connection ID</label>
            <Input
              value={dbConnectionId}
              onChange={(e) => setDbConnectionId(e.target.value)}
              placeholder="DB Connection Id"
              className="w-64 semi-text-bg-color hover:semi-text-bg-color"
            />
          </div>
          <div className="flex flex-col">
            <label>Output Table Name</label>
            <Input
              type="text"
              value={outputTableName ?? constants.General.EmptyString}
              onChange={(e) => setOutputTableName(e.target.value)}
              className="w-36 semi-text-bg-color hover:semi-text-bg-color"
            />
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-1 overflow-hidden">
          {/* SQL editor */}
          <div className="flex-1 flex flex-col p-3 min-w-0">
            <label>SQL Statement</label>
            <div className="flex-1 border rounded overflow-hidden">
              <CodeMirror
                value={sqlStmt}
                height="100%"
                extensions={[sqlLang()]}
                theme={getIsDarkMode() ? githubDark : githubLight}
                onChange={(v) => setSqlStmt(v)}
              />
            </div>
          </div>

          {/* 파라미터 슬라이딩 패널 */}
          <div
            className="relative border-l overflow-hidden transition-all duration-200 ease-in-out"
            style={{
              width: showParamsPanel ? panelWidth : 0,
              minWidth: showParamsPanel ? 200 : 0,
            }}
          >
            {showParamsPanel && (
              <>
                <div className="p-3 h-full overflow-auto flex flex-col">
                  <div className="flex flex-col mb-2">
                    <label>Sql Parameters</label>
                    <label className="flex flex-col justify-start text-left">
                      {"Binding path: ${path}"}
                    </label>
                    <label className="flex flex-col justify-start text-left">
                      {`Index variable path: #{path}`}
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        className="px-2 py-1 text-sm general-text-bg-color"
                        onClick={() =>
                          setParams((prev) => [
                            ...prev,
                            {
                              name: constants.General.EmptyString,
                              binding: constants.General.EmptyString,
                            },
                          ])
                        }
                      >
                        Add Param.
                      </Button>
                      <Button
                        className="px-2 py-1 text-sm general-text-bg-color"
                        onClick={() => {
                          const matches = (
                            sqlStmt.match(/@[\w가-힣]+/g) || []
                          ).map((m) => m.slice(1));
                          const uniq = Array.from(new Set(matches));
                          setParams((prev) => {
                            const map = new Map(prev.map((p) => [p.name, p]));
                            return uniq.map(
                              (name) =>
                                map.get(name) ?? {
                                  name,
                                  binding: constants.General.EmptyString,
                                }
                            );
                          });
                        }}
                      >
                        Extract
                      </Button>
                    </div>
                  </div>

                  <Table
                    rowKey={(r) =>
                      r.name ?? Math.random().toString(36).slice(2)
                    }
                    dataSource={params}
                    columns={columns}
                    pagination={false}
                    size="small"
                  />
                </div>

                {/* 패널 resize handle */}
                <div
                  onMouseDown={(e) => {
                    panelResizing.current = true;
                    lastX.current = e.clientX;
                    document.body.style.userSelect = "none";
                  }}
                  className="absolute left-0 top-0 h-full w-1 cursor-ew-resize"
                />
              </>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="p-3 border-t flex justify-end gap-2">
          <Button
            className="general-text-bg-color"
            // type="primary"
            onClick={handleSave}
          >
            Save
          </Button>
          <Button className="medium-text-bg-color" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* modal resize handle */}
        <div
          onMouseDown={(e) => {
            isResizing.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none";
          }}
          style={{
            width: 18,
            height: 18,
            position: "absolute",
            right: 0,
            bottom: 0,
            cursor: "nwse-resize",
            background:
              "linear-gradient(135deg, transparent 40%, gray 40%, gray 60%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
};
