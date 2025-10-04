import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { JsonDatasetManager } from "@/components/workflow/jsonDatasetManager";
import type { JsonObject } from "@/components/workflow/jsonDatasetManager";

export type JsonColumnType = "string" | "number" | "boolean";
type JsonDatasetEditorMode = "schema" | "data";

interface JsonDatasetEditorModalProps {
  open: boolean;
  mode: JsonDatasetEditorMode;
  value?: Record<string, any[]>; // 테이블 이름 -> 데이터 배열
  onConfirm: (data: Record<string, JsonObject[]>) => void;
  onCancel?: () => void;
}

/* -------------------- CellEditor -------------------- */
const CellEditor: React.FC<{
  initialValue: any;
  colType: JsonColumnType;
  onUpdate: (newValue: any) => void;
}> = ({ initialValue, colType, onUpdate }) => {
  const [cellValue, setCellValue] = useState(String(initialValue));

  const commitChange = () => {
    let parsed: any = cellValue;
    if (colType === "number") parsed = Number(cellValue) || 0;
    if (colType === "boolean") parsed = cellValue === "true";
    onUpdate(parsed);
  };

  if (colType === "boolean") {
    return (
      <select
        value={String(cellValue)}
        onChange={(e) => {
          setCellValue(e.target.value);
          onUpdate(e.target.value === "true");
        }}
        className="w-full border-none outline-none bg-white"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  return (
    <input
      type={colType === "number" ? "number" : "text"}
      value={cellValue}
      onChange={(e) => setCellValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={(e) => e.key === "Enter" && commitChange()}
      className="w-full border-none outline-none bg-white"
    />
  );
};

/* -------------------- JsonDatasetEditorModal -------------------- */
export const JsonDatasetEditorModal: React.FC<JsonDatasetEditorModalProps> = ({
  open,
  mode,
  value = {},
  onConfirm,
  onCancel,
}) => {
  const [internalData, setInternalData] = useState<
    Record<string, JsonObject[]>
  >({});
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [manager, setManager] = useState(() => new JsonDatasetManager({}));

  const isSchemaMode = mode === "schema";
  const isDataMode = mode === "data";

  /* ---------------- Drag 이동 ---------------- */
  const modalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDrag);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    }
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging]);

  /* ---------------- 초기화 ---------------- */
  useEffect(() => {
    const initData: Record<string, JsonObject[]> = {};
    Object.entries(value).forEach(([tableName, arr]: any) => {
      if (Array.isArray(arr)) {
        initData[tableName] = arr as JsonObject[];
      }
    });

    const newManager = new JsonDatasetManager(initData);
    setManager(newManager);
    setInternalData(initData);
    setSelectedTable(Object.keys(initData)[0] || null);

    setPos({
      x: window.innerWidth / 2 - 400,
      y: window.innerHeight / 2 - 300,
    });
  }, [value]);

  /* ---------------- 유틸 함수 ---------------- */
  const getDefaultValue = (type: JsonColumnType) => {
    switch (type) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
    }
  };

  /* ---------------- 테이블 관리 ---------------- */
  const tableKeys = Object.keys(manager.getData());

  const addTable = () => {
    if (!isSchemaMode) return;
    const name = prompt("새 테이블 이름:", `table_${tableKeys.length + 1}`);
    if (!name || manager.getData()[name]) return;
    manager.addTable(name, []);
    setManager(new JsonDatasetManager(manager.getData()));
    setSelectedTable(name);
    setInternalData({ ...manager.getData() });
  };

  const removeTable = (key: string) => {
    if (!isSchemaMode) return;
    manager.removeTable(key);
    const newKeys = Object.keys(manager.getData());
    setSelectedTable(newKeys[0] || null);
    setInternalData({ ...manager.getData() });
  };

  const renameTable = (oldKey: string) => {
    if (!isSchemaMode) return;
    const newKey = prompt("새 테이블 이름:", oldKey);
    if (!newKey || newKey === oldKey || manager.getData()[newKey]) return;
    const data = manager.getTable(oldKey) ?? [];
    manager.removeTable(oldKey);
    manager.addTable(newKey, data);
    setManager(new JsonDatasetManager(manager.getData()));
    setSelectedTable(newKey);
    setInternalData({ ...manager.getData() });
  };

  /* ---------------- 컬럼 관리 ---------------- */
  const addColumn = () => {
    if (!selectedTable || !isSchemaMode) return;
    const name = prompt("컬럼 이름:");
    if (!name) return;
    const type = (prompt("타입 선택 (string, number, boolean):", "string") ??
      "string") as JsonColumnType;

    manager.addColumn(selectedTable, { name, type });
    const table = manager.getTable(selectedTable) ?? [];
    table.forEach((row, i) => {
      row[name] = getDefaultValue(type);
      manager.updateRow(selectedTable, i, row);
    });
    setInternalData({ ...manager.getData() });
  };

  const removeColumn = (colKey: string) => {
    if (!selectedTable || !isSchemaMode) return;
    const table = manager.getTable(selectedTable) ?? [];
    table.forEach((row, i) => {
      delete row[colKey];
      manager.updateRow(selectedTable, i, row);
    });
    manager.removeColumn(selectedTable, colKey);
    setInternalData({ ...manager.getData() });
  };

  /* ---------------- 행 관리 ---------------- */
  const addRow = () => {
    if (!selectedTable || !isDataMode) return;
    const cols = manager.getColumns(selectedTable) ?? [];
    const newRow: JsonObject = {};
    cols.forEach(
      (c) => (newRow[c.name] = getDefaultValue(c.type as JsonColumnType))
    );
    manager.addRow(selectedTable, newRow);
    setInternalData({ ...manager.getData() });
  };

  const removeRow = (i: number) => {
    if (!selectedTable || !isDataMode) return;
    manager.removeRow(selectedTable, i);
    setInternalData({ ...manager.getData() });
  };

  const updateCell = (rowIndex: number, colKey: string, value: any) => {
    if (!selectedTable || !isDataMode) return;
    const table = manager.getTable(selectedTable) ?? [];
    const newRow = { ...table[rowIndex], [colKey]: value };
    manager.updateRow(selectedTable, rowIndex, newRow);
    setInternalData({ ...manager.getData() });
  };

  /* ---------------- 렌더링 ---------------- */
  if (!open) return null;

  const columns = selectedTable ? manager.getColumns(selectedTable) ?? [] : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        className="bg-white p-4 w-[800px] max-h-[600px] overflow-auto absolute shadow-lg"
        style={{ left: pos.x, top: pos.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex justify-between mb-2 cursor-move"
          onMouseDown={startDrag}
        >
          <h3>
            JSON Dataset Editor ({mode === "schema" ? "Schema" : "Data"} Mode)
          </h3>
        </div>

        {/* 테이블 선택 */}
        <div className="flex mb-2 flex-wrap">
          {tableKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTable(key)}
              onDoubleClick={() => renameTable(key)}
              className={`mr-2 mb-2 px-2 py-1 border ${
                key === selectedTable ? "bg-blue-200" : ""
              }`}
            >
              {key}
            </button>
          ))}
          {isSchemaMode && (
            <>
              <button
                onClick={addTable}
                className="px-2 py-1 border bg-green-200 h-8"
              >
                + Table
              </button>
              {selectedTable && (
                <button
                  onClick={() => removeTable(selectedTable)}
                  className="px-2 py-1 border bg-red-200 ml-1 h-8"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>

        {/* 테이블 내용 */}
        {selectedTable && (
          <div className="overflow-auto max-h-[400px] border p-1">
            {isSchemaMode ? (
              <table className="table-auto border-collapse border w-full text-sm">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.name}
                        className="border px-2 py-1 bg-gray-300"
                      >
                        {col.name} ({col.type})
                        <button
                          onClick={() => removeColumn(col.name)}
                          className="text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </th>
                    ))}
                    <th className="border px-2 py-1">
                      <button onClick={addColumn} className="bg-green-200 px-1">
                        + Column
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {columns.map((col) => (
                      <td key={col.name} className="border px-2 py-1">
                        {String(getDefaultValue(col.type as JsonColumnType))}
                      </td>
                    ))}
                    <td className="border px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="table-auto border-collapse border w-full text-sm">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.name}
                        className="border px-2 py-1 bg-gray-300"
                      >
                        {col.name} ({col.type})
                      </th>
                    ))}
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manager.getTable(selectedTable)?.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col.name} className="border px-2 py-1">
                          <CellEditor
                            initialValue={row[col.name]}
                            colType={col.type as JsonColumnType}
                            onUpdate={(val) => updateCell(i, col.name, val)}
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => removeRow(i)}
                          className="bg-red-200 px-1"
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {isDataMode && (
              <button onClick={addRow} className="bg-green-200 px-2 py-1 mt-1">
                + Row
              </button>
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onCancel} className="px-4 py-2 border bg-gray-300">
            Close
          </button>
          <button
            onClick={() => onConfirm({ ...internalData })}
            className="px-4 py-2 border bg-blue-300"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
