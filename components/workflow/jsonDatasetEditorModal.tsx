import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { JsonDatasetManager } from "@/components/workflow/jsonDatasetManager";
import type { JsonObject } from "@/components/workflow/jsonDatasetManager";

type JsonDatasetEditorMode = "schema" | "data";
export type JsonColumnType = "string" | "number" | "boolean";
interface JsonDatasetEditorModalProps {
  open: boolean;
  mode: JsonDatasetEditorMode;
  value?: Record<string, any[]>; // 컬럼 정의 배열 또는 JsonObject[]
  onConfirm: (data: Record<string, JsonObject[]>) => void;
  onCancel?: () => void;
}

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
  const modalRef = useRef<HTMLDivElement>(null);

  const isSchemaMode = mode === "schema";
  const isDataMode = mode === "data";

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
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

  // ---------------- 유틸: 타입별 기본값 ----------------
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

  // ---------------- 모달 초기화 ----------------
  useEffect(() => {
    const initData: Record<string, JsonObject[]> = {};

    Object.entries(value).forEach(([tableName, arr]: any) => {
      if (
        Array.isArray(arr) &&
        arr.length > 0 &&
        "key" in arr[0] &&
        "type" in arr[0]
      ) {
        // 컬럼 정의 배열이면 첫 행 생성
        const firstRow: JsonObject = {};
        arr.forEach((col: any) => {
          // object/array 제거
          if (
            [
              "string",
              "number",
              "boolean",
              "null",
              "date",
              "datetime",
            ].includes(col.type)
          ) {
            firstRow[col.key] = getDefaultValue(col.type as JsonColumnType);
          }
        });
        initData[tableName] = [firstRow];
      } else {
        // 기존 JsonObject[] 형식이면 그대로 사용
        initData[tableName] = arr as JsonObject[];
      }
    });

    setInternalData(initData);
    const newManager = new JsonDatasetManager(initData);
    setManager(newManager);
    setSelectedTable(Object.keys(newManager.getData())[0] || null);

    setPosition({
      x: window.innerWidth / 2 - 400,
      y: window.innerHeight / 2 - 300,
    });
  }, [value]);

  // ---------------- 테이블/컬럼 관리 ----------------
  const tableKeys = Object.keys(manager.getData());
  const selectTable = (key: string) => setSelectedTable(key);

  const addTable = () => {
    if (!isSchemaMode) return;
    const newKey = `table_${tableKeys.length + 1}`;
    manager.addTable(newKey, []);
    setSelectedTable(newKey);
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
    setSelectedTable(newKey);
    setInternalData({ ...manager.getData() });
  };

  const addColumn = () => {
    if (!selectedTable || !isSchemaMode) return;
    const colName = prompt("컬럼 이름:");
    if (!colName) return;
    const type = (prompt("타입 선택 (string, number, boolean):", "string") ??
      "string") as JsonColumnType;

    manager.addColumn(selectedTable, { name: colName, type });

    let table = manager.getTable(selectedTable) ?? [];
    if (table.length === 0) {
      const newRow: Record<string, any> = {};
      newRow[colName] = getDefaultValue(type);
      manager.addRow(selectedTable, newRow);
    } else {
      table.forEach((row, i) => {
        row[colName] = getDefaultValue(type);
        manager.updateRow(selectedTable, i, row);
      });
    }
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

  // ---------------- 행 관리 ----------------
  const addRow = () => {
    if (!selectedTable || !isDataMode) return;
    const table = manager.getTable(selectedTable) ?? [];
    const cols =
      manager
        .getColumns(selectedTable)
        ?.filter((col) =>
          ["string", "number", "boolean", "null", "date", "datetime"].includes(
            col.type
          )
        ) ?? [];
    const newRow: JsonObject = {};
    cols.forEach(
      (col) => (newRow[col.name] = getDefaultValue(col.type as JsonColumnType))
    );
    manager.addRow(selectedTable, newRow);
    setInternalData({ ...manager.getData() });
  };

  const removeRow = (index: number) => {
    if (!selectedTable || !isDataMode) return;
    manager.removeRow(selectedTable, index);
    setInternalData({ ...manager.getData() });
  };

  const updateCell = (rowIndex: number, colKey: string, value: any) => {
    if (!selectedTable || !isDataMode) return;
    const table = manager.getTable(selectedTable) ?? [];
    const newRow = { ...table[rowIndex], [colKey]: value };
    manager.updateRow(selectedTable, rowIndex, newRow);
    setInternalData({ ...manager.getData() });
  };

  // ---------------- 렌더링 ----------------
  if (!open) return null;

  const visibleColumns = selectedTable
    ? manager
        .getColumns(selectedTable)
        ?.filter((col) =>
          ["string", "number", "boolean", "null", "date", "datetime"].includes(
            col.type
          )
        ) ?? []
    : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        className="bg-white p-4 w-[800px] max-h-[600px] overflow-auto absolute shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          resize: "both",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between mb-2 cursor-move"
          onMouseDown={startDrag}
        >
          <h3>
            JsonDataset Editor ({isSchemaMode ? "Schema Mode" : "Data Mode"})
          </h3>
        </div>

        {/* 테이블 선택 */}
        <div className="flex mb-2 flex-wrap">
          {tableKeys.map((key) => (
            <button
              key={key}
              className={`mr-2 mb-2 px-2 py-1 h-8 border ${
                key === selectedTable ? "bg-blue-200" : ""
              }`}
              onClick={() => selectTable(key)}
              onDoubleClick={() => renameTable(key)}
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

        {/* 테이블 뷰 */}
        {selectedTable && (
          <div className="overflow-auto max-h-[400px] border p-1">
            {isSchemaMode ? (
              <table className="table-auto border-collapse border w-full text-sm">
                <thead>
                  <tr>
                    {visibleColumns.map((col) => (
                      <th
                        key={col.name}
                        className="border px-2 py-1 bg-gray-300"
                      >
                        {col.name} ({col.type})
                        <button
                          onClick={() => removeColumn(col.name)}
                          className="text-red-500 ml-1"
                        >
                          x
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
                    {visibleColumns.map((col) => (
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
                    {manager.getColumns(selectedTable)?.map((col) => (
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
                      {manager.getColumns(selectedTable)?.map((col) => (
                        <td key={col.name} className="border px-2 py-1">
                          <input
                            value={String(row[col.name] ?? "")}
                            onChange={(e) =>
                              updateCell(i, col.name, e.target.value)
                            }
                            className="w-full border-none outline-none bg-white"
                          />
                        </td>
                      ))}
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => removeRow(i)}
                          className="bg-red-200 px-1"
                        >
                          Del.
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

        {/* 완료 버튼 */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => onCancel?.()}
            className="px-4 py-2 border bg-gray-300"
          >
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
