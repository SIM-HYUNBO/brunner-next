// components/workflow/SqlEditorModal.tsx
import React, { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { Table, Input, Select, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SqlParam, SqlNodeData } from "./types/sql";
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";

interface SqlEditorModalProps {
  open: boolean;
  initialDbConnectionId?: string;
  initialSqlStmt?: string;
  initialParams?: SqlParam[];
  initialMaxRows?: number;
  onSave: (result: SqlNodeData) => void;
  onClose: () => void;
}

export const SqlEditorModal: React.FC<SqlEditorModalProps> = ({
  open,
  initialDbConnectionId = "",
  initialSqlStmt = "",
  initialParams = [],
  initialMaxRows,
  onSave,
  onClose,
}) => {
  // state
  const [sqlStmt, setSqlStmt] = useState(initialSqlStmt ?? "");
  const [params, setParams] = useState<SqlParam[]>(initialParams ?? []);
  const [maxRows, setMaxRows] = useState<number | undefined>(initialMaxRows);
  const [dbConnectionId, setDbConnectionId] = useState(
    initialDbConnectionId ?? ""
  );

  // 동기화: props -> state
  useEffect(() => {
    setDbConnectionId(initialDbConnectionId ?? "");
    setSqlStmt(initialSqlStmt ?? "");
    setParams(initialParams ?? []);
    setMaxRows(initialMaxRows);
  }, [initialDbConnectionId, initialSqlStmt, initialParams, initialMaxRows]);

  // modal position/size
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(520);
  const [position, setPosition] = useState({ x: 200, y: 100 });

  // drag / resize refs
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // binding panel
  const [showBindingPanel, setShowBindingPanel] = useState(false);
  const [bindingWidth, setBindingWidth] = useState(300);
  const bindingResizing = useRef(false);
  const lastBindingX = useRef(0);

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
      } else if (bindingResizing.current) {
        const dx = lastBindingX.current - e.clientX;
        setBindingWidth((w) => Math.max(160, w + dx));
        lastBindingX.current = e.clientX;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
      bindingResizing.current = false;
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
      title: "파라미터",
      dataIndex: "name",
      key: "name",
      render: (val) => <span className="truncate">{val ?? "(unnamed)"}</span>,
    },
    {
      title: "타입",
      dataIndex: "type",
      key: "type",
      render: (val, rec, idx) => (
        <Select
          className="w-28"
          value={val ?? "string"}
          onChange={(v) =>
            setParams((prev) =>
              prev.map((p, i) => (i === idx ? { ...p, type: v } : p))
            )
          }
          options={[
            { label: "string", value: "string" },
            { label: "number", value: "number" },
            { label: "boolean", value: "boolean" },
            { label: "object", value: "object" },
          ]}
        />
      ),
    },
    {
      title: "바인딩",
      key: "binding",
      width: 80,
      render: (_, __, idx) => (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm px-2 py-1 bg-gray-100 border rounded hover:bg-gray-200"
            onClick={() => setShowBindingPanel(true)}
            title="Open bindings panel"
          >
            🔧
          </button>
        </div>
      ),
    },
  ];

  const handleSave = () => {
    const out: SqlNodeData = {
      dbConnectionId,
      sqlStmt,
      sqlParams: params,
      maxRows: maxRows && maxRows > 0 ? maxRows : undefined,
    };
    onSave(out);
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
        {/* Title bar */}
        <div
          className="flex items-center justify-between p-2 bg-gray-100 border-b cursor-move select-none"
          onMouseDown={(e) => {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none";
          }}
        >
          <div className="font-semibold">SQL 편집 및 파라미터</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setShowBindingPanel((s) => !s)}
            >
              {showBindingPanel ? "바인딩 닫기" : "바인딩 열기"}
            </button>
          </div>
        </div>

        {/* Top inputs */}
        <div className="flex gap-4 p-3 border-b">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">DB 연결 ID</label>
            <Input
              value={dbConnectionId}
              onChange={(e) => setDbConnectionId(e.target.value)}
              placeholder="myDbConnectionId"
              className="w-64"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Max Rows (0 = 무제한)
            </label>
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

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* SQL Editor */}
          <div className="flex-1 flex flex-col p-3 min-w-0">
            <label className="text-sm font-medium mb-2">SQL 문</label>
            <div className="flex-1 border rounded overflow-hidden">
              <CodeMirror
                value={sqlStmt}
                height="100%"
                extensions={[sqlLang()]}
                theme={getIsDarkMode() ? githubDark : githubLight}
                onChange={(v) => setSqlStmt(v)}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Params Table + 자동추출 */}
          <div className="w-1/3 min-w-[260px] p-3 overflow-auto border-l">
            <div className="flex justify-between mb-2">
              <h4>Parameters</h4>
              <div className="flex gap-1">
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() =>
                    setParams((prev) => [
                      ...prev,
                      { name: "", type: "string", binding: "" },
                    ])
                  }
                >
                  + 파라미터
                </button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => {
                    const matches = (sqlStmt.match(/@\w+/g) || []).map((m) =>
                      m.slice(1)
                    );
                    const uniq = Array.from(new Set(matches));
                    setParams((prev) => {
                      const map = new Map(prev.map((p) => [p.name, p]));
                      return uniq.map(
                        (name) =>
                          map.get(name) ?? { name, type: "string", binding: "" }
                      );
                    });
                  }}
                >
                  자동추출
                </button>
              </div>
            </div>

            <Table<SqlParam>
              rowKey={(r) => r.name ?? Math.random().toString(36).slice(2)}
              dataSource={params}
              columns={columns}
              pagination={false}
              size="small"
            />
          </div>

          {/* Sliding Binding Panel */}
          <div
            className="relative h-full bg-gray-50 border-l transition-all duration-200 ease-in-out overflow-hidden"
            style={{
              width: showBindingPanel ? bindingWidth : 0,
              minWidth: showBindingPanel ? 160 : 0,
            }}
          >
            {showBindingPanel && (
              <>
                <div className="p-3 h-full overflow-auto">
                  <h4 className="font-medium mb-3">Bindings</h4>
                  {params.map((p, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        className="flex-1 border rounded px-2 py-1"
                        placeholder="name"
                        value={p.name ?? ""}
                        onChange={(e) =>
                          setParams((prev) =>
                            prev.map((pp, idx) =>
                              idx === i ? { ...pp, name: e.target.value } : pp
                            )
                          )
                        }
                      />
                      <select
                        className="w-28 border rounded px-2 py-1"
                        value={p.type ?? "string"}
                        onChange={(e) =>
                          setParams((prev) =>
                            prev.map((pp, idx) =>
                              idx === i
                                ? {
                                    ...pp,
                                    type: e.target.value as SqlParam["type"],
                                  }
                                : pp
                            )
                          )
                        }
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="object">object</option>
                      </select>
                      <input
                        className="flex-1 border rounded px-2 py-1"
                        placeholder="binding (예: input.userId)"
                        value={p.binding ?? ""}
                        onChange={(e) =>
                          setParams((prev) =>
                            prev.map((pp, idx) =>
                              idx === i
                                ? { ...pp, binding: e.target.value }
                                : pp
                            )
                          )
                        }
                      />
                      <button
                        className="px-2 py-1 text-sm rounded bg-red-500 text-white"
                        onClick={() =>
                          setParams((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                {/* resize handle */}
                <div
                  onMouseDown={(e) => {
                    bindingResizing.current = true;
                    lastBindingX.current = e.clientX;
                    document.body.style.userSelect = "none";
                  }}
                  className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-gray-300 hover:bg-gray-400"
                />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
          <Button onClick={onClose}>닫기</Button>
          <Button type="primary" onClick={handleSave}>
            저장
          </Button>
        </div>

        {/* Resize handle */}
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
