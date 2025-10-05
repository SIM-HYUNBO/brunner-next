// components/workflow/SqlEditorModal.tsx
import React, { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { Table, Input, Select, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SqlParam, SqlNodeData } from "./types/sql";

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
  // state (초기값 방어: 빈문자열/빈배열 사용)
  const [sqlStmt, setSqlStmt] = useState<string>(initialSqlStmt ?? "");
  const [params, setParams] = useState<SqlParam[]>(initialParams ?? []);
  const [maxRows, setMaxRows] = useState<number | undefined>(initialMaxRows);
  const [dbConnectionId, setDbConnectionId] = useState<string>(
    initialDbConnectionId ?? ""
  );

  // modal position/size
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(520);
  const [position, setPosition] = useState({ x: 200, y: 100 });

  // drag / resize refs
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // binding panel
  const [showBindingPanel, setShowBindingPanel] = useState(false);
  const [bindingWidth, setBindingWidth] = useState<number>(300);
  const bindingResizing = useRef(false);
  const lastBindingX = useRef(0);

  // sync props -> state when inputs change externally
  useEffect(() => setSqlStmt(initialSqlStmt ?? ""), [initialSqlStmt]);
  useEffect(() => setParams(initialParams ?? []), [initialParams]);
  useEffect(() => setMaxRows(initialMaxRows), [initialMaxRows]);
  useEffect(
    () => setDbConnectionId(initialDbConnectionId ?? ""),
    [initialDbConnectionId]
  );

  // global mouse handlers for drag/resize/binding-resize
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
        const dx = lastBindingX.current - e.clientX; // invert to make handle movement intuitive
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

  // Table columns: 이름/타입만 보여주고 바인딩은 우측 패널에서 편집
  const columns: ColumnsType<SqlParam> = [
    {
      title: "파라미터",
      dataIndex: "name",
      key: "name",
      render: (val, rec, idx) => (
        <div className="flex items-center gap-2">
          <span className="truncate">{val ?? "(unnamed)"}</span>
        </div>
      ),
    },
    {
      title: "타입",
      dataIndex: "type",
      key: "type",
      render: (val, rec, idx) => (
        <Select
          className="w-28"
          value={val ?? "string"}
          onChange={(v) => {
            setParams((prev) =>
              prev.map((p, i) => (i === idx ? { ...p, type: v } : p))
            );
          }}
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
        <div className="flex items-center justify-end">
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

  // onSave: 전달되는 형태 맞추기
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
        {/* title bar */}
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
            {/* <button
              type="button"
              className="px-2 py-1 ml-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              onClick={onCancel}
            >
              닫기
            </button> */}
          </div>
        </div>

        {/* top inputs (DB connection, MaxRows) */}
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

        {/* body: editor + table + sliding binding panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* left: SQL editor */}
          <div className="flex-1 flex flex-col p-3 min-w-0">
            <label className="text-sm font-medium mb-2">SQL 문</label>
            <div className="flex-1 border rounded overflow-hidden h-full">
              <CodeMirror
                value={sqlStmt}
                extensions={[sqlLang()]}
                height="100%"
                theme={oneDark}
                onChange={(v) => setSqlStmt(v)}
              />
            </div>
          </div>

          {/* center: params table */}
          <div className="w-1/3 min-w-[260px] p-3 overflow-auto border-l">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Parameters</h4>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
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
                  className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => {
                    // 자동 추출 (SQL 내부 @params)
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

          {/* right: sliding binding panel */}
          <div
            className={`relative h-full bg-gray-50 border-l transition-all duration-200 ease-in-out overflow-hidden`}
            style={{
              width: showBindingPanel ? bindingWidth : 0,
              minWidth: showBindingPanel ? 160 : 0,
            }}
          >
            {showBindingPanel && (
              <>
                <div className="p-3 h-full overflow-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Bindings</h4>
                  </div>

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

                  <div className="mt-2">
                    <Button
                      type="default"
                      onClick={() =>
                        setParams((prev) => [
                          ...prev,
                          { name: "", type: "string", binding: "" },
                        ])
                      }
                    >
                      파라미터 추가
                    </Button>
                  </div>
                </div>

                {/* left-side resize handle */}
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

        {/* footer buttons */}
        <div className="p-3 border-t bg-gray-50 flex justify-end gap-2">
          <Button onClick={onClose}>닫기</Button>
          <Button type="primary" onClick={handleSave}>
            저장
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
