// components/workflow/SqlEditorModal.tsx
import React, { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { Input, Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SqlParam, SqlNodeDesignData } from "./types/nodeTypes";
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";

interface SqlEditorModalProps {
  open: boolean;
  initialDbConnectionId?: string | undefined;
  initialSqlStmt?: string | undefined;
  initialParams?: SqlParam[] | undefined;
  initialMaxRows?: number | undefined;
  onConfirm: (result: SqlNodeDesignData) => void;
  onClose: () => void;
}

export const SqlEditorModal: React.FC<SqlEditorModalProps> = ({
  open,
  initialDbConnectionId = "",
  initialSqlStmt = "",
  initialParams = [],
  initialMaxRows,
  onConfirm,
  onClose,
}) => {
  const [sqlStmt, setSqlStmt] = useState(initialSqlStmt);
  const [params, setParams] = useState<SqlParam[]>(initialParams);
  const [maxRows, setMaxRows] = useState<number | undefined>(initialMaxRows);
  const [dbConnectionId, setDbConnectionId] = useState(initialDbConnectionId);

  // sliding panel
  const [showParamsPanel, setShowParamsPanel] = useState(true);
  const [panelWidth, setPanelWidth] = useState(300);
  const panelResizing = useRef(false);
  const lastX = useRef(0);

  // drag/resize modal
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(520);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // sync props
  useEffect(() => {
    setDbConnectionId(initialDbConnectionId);
    setSqlStmt(initialSqlStmt);
    setParams(initialParams);
    setMaxRows(initialMaxRows);
  }, [initialDbConnectionId, initialSqlStmt, initialParams, initialMaxRows]);

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
      document.body.style.userSelect = "";
    };
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
      title: "Path or Value",
      dataIndex: "binding",
      key: "binding",
      render: (_, rec, idx) => {
        const displayValue = rec.binding ?? rec.value ?? "";
        return (
          <input
            className="w-full border rounded px-2 py-1"
            value={displayValue}
            placeholder="변수 경로 {{userId}} 또는 값 123"
            onChange={(e) =>
              setParams((prev) =>
                prev.map((p, i) =>
                  i === idx
                    ? rec.binding
                      ? { ...p, binding: e.target.value } // 기존 binding이 있으면 binding 수정
                      : { ...p, value: e.target.value } // 없으면 value 수정
                    : p
                )
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
        <button
          className="px-2 py-1 text-sm rounded bg-red-500 text-white"
          onClick={() => setParams((prev) => prev.filter((_, i) => i !== idx))}
        >
          Del.
        </button>
      ),
    },
  ];

  const handleSave = () => {
    const out: SqlNodeDesignData = {
      dbConnectionId,
      sqlStmt,
      sqlParams: params.map((p) => {
        const isVar = /\{\{.*\}\}|\$\{.*\}/.test(p.binding ?? "");
        return {
          ...p,
          value: isVar ? undefined : p.value,
          binding: isVar ? p.binding : undefined,
        };
      }),
      maxRows: maxRows && maxRows > 0 ? maxRows : undefined,
    };
    onConfirm(out);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div
        ref={dragRef}
        className="absolute bg-white border border-gray-300 rounded shadow-lg flex flex-col"
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
          className="flex items-center justify-between p-2 bg-gray-100 border-b cursor-move select-none"
          onMouseDown={(e) => {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none";
          }}
        >
          <div className="font-semibold">SQL 편집기 & 파라미터</div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 border rounded text-sm bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowParamsPanel((s) => !s)}
            >
              {showParamsPanel ? "Close params." : "View params"}
            </button>
          </div>
        </div>

        {/* 상단 입력 */}
        <div className="flex gap-4 p-3 border-b">
          <div className="flex flex-col">
            <label>DB 연결 ID</label>
            <Input
              value={dbConnectionId}
              onChange={(e) => setDbConnectionId(e.target.value)}
              placeholder="myDbConnectionId"
              className="w-64"
            />
          </div>
          <div className="flex flex-col">
            <label>Max Rows (0 = 무제한)</label>
            <Input
              type="number"
              value={maxRows ?? 0}
              onChange={(e) =>
                setMaxRows(
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className="w-36"
            />
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-1 overflow-hidden">
          {/* SQL editor */}
          <div className="flex-1 flex flex-col p-3 min-w-0">
            <label>SQL 문</label>
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
            className="relative bg-gray-50 border-l overflow-hidden transition-all duration-200 ease-in-out"
            style={{
              width: showParamsPanel ? panelWidth : 0,
              minWidth: showParamsPanel ? 200 : 0,
            }}
          >
            {showParamsPanel && (
              <>
                <div className="p-3 h-full overflow-auto flex flex-col">
                  <div className="flex flex-col justify-between items-center mb-2">
                    <h4>Parameters</h4>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() =>
                          setParams((prev) => [
                            ...prev,
                            { name: "", binding: "" },
                          ])
                        }
                      >
                        Add Param.
                      </button>
                      <button
                        className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        onClick={() => {
                          const matches = (sqlStmt.match(/@\w+/g) || []).map(
                            (m) => m.slice(1)
                          );
                          const uniq = Array.from(new Set(matches));
                          setParams((prev) => {
                            const map = new Map(prev.map((p) => [p.name, p]));
                            return uniq.map(
                              (name) => map.get(name) ?? { name, binding: "" }
                            );
                          });
                        }}
                      >
                        Extract
                      </button>
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
                  className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400"
                />
              </>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
          <Button onClick={onClose}>닫기</Button>
          <Button type="primary" onClick={handleSave}>
            Save
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
