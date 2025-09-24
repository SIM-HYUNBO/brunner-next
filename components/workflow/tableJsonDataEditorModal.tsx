import * as React from "react";
import { useState, useEffect } from "react";
import { TableJsonDataManager } from "@/components/workflow/tableJsonDataManager";
import type { JsonObject } from "@/components/workflow/tableJsonDataManager";
interface TableJsonDataEditorModalProps {
  open: boolean;
  value?: Record<string, JsonObject[]>;
  onConfirm: (data: Record<string, JsonObject[]>) => void;
  onCancel?: () => void;
}

export const TableJsonDataEditorModal: React.FC<
  TableJsonDataEditorModalProps
> = ({ open, value = {}, onConfirm, onCancel }) => {
  const [internalData, setInternalData] = useState(value);
  const [selectedTable, setSelectedTable] = useState<string | null>(
    Object.keys(value)[0] || null
  );
  const [manager, setManager] = useState(() => new TableJsonDataManager(value));

  useEffect(() => {
    setInternalData(value);
    setManager(new TableJsonDataManager(value));
    setSelectedTable(Object.keys(value)[0] || null);
  }, [value]);

  if (!open) return null;

  const tableKeys = Object.keys(manager.getData());

  const selectTable = (key: string) => setSelectedTable(key);

  const addTable = () => {
    const newKey = `table_${tableKeys.length + 1}`;
    manager.addTable(newKey, []);
    setSelectedTable(newKey);
    setInternalData({ ...manager.getData() });
  };

  const removeTable = (key: string) => {
    manager.removeTable(key);
    const newKeys = Object.keys(manager.getData());
    setSelectedTable(newKeys[0] || null);
    setInternalData({ ...manager.getData() });
  };

  const renameTable = (oldKey: string) => {
    const newKey = prompt("새 테이블 이름:", oldKey);
    if (!newKey || newKey === oldKey || manager.getData()[newKey]) return;
    const data = manager.getTable(oldKey) ?? [];
    manager.removeTable(oldKey);
    manager.addTable(newKey, data);
    setSelectedTable(newKey);
    setInternalData({ ...manager.getData() });
  };

  // 행/열 편집
  const addRow = () => {
    if (!selectedTable) return;
    const table = manager.getTable(selectedTable) ?? [];
    const cols = table[0] ? Object.keys(table[0]) : [];

    const newRow: JsonObject = {};
    cols.forEach((c) => (newRow[c] = ""));
    manager.addRow(selectedTable, newRow);
    setInternalData({ ...manager.getData() });
  };

  const removeRow = (index: number) => {
    if (!selectedTable) return;
    manager.removeRow(selectedTable, index);
    setInternalData({ ...manager.getData() });
  };

  const updateCell = (rowIndex: number, colKey: string, value: any) => {
    if (!selectedTable) return;
    const table = manager.getTable(selectedTable) ?? [];
    const newRow = { ...table[rowIndex], [colKey]: value };
    manager.updateRow(selectedTable, rowIndex, newRow);
    setInternalData({ ...manager.getData() });
  };

  const addColumn = () => {
    if (!selectedTable) return;
    const colName = prompt("컬럼 이름:");
    if (!colName) return;
    const table = manager.getTable(selectedTable) ?? [];
    table.forEach((row, i) => {
      row[colName] = "";
      manager.updateRow(selectedTable, i, row);
    });
    setInternalData({ ...manager.getData() });
  };

  const removeColumn = (colKey: string) => {
    if (!selectedTable) return;
    const table = manager.getTable(selectedTable) ?? [];
    table.forEach((row, i) => {
      delete row[colKey];
      manager.updateRow(selectedTable, i, row);
    });
    setInternalData({ ...manager.getData() });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-4 w-[90%] max-w-[800px] max-h-[90%] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-2">
          <h3>TableJsonData Editor</h3>
        </div>

        {/* 테이블 선택 버튼 */}
        <div className="flex mb-2 flex-wrap">
          {tableKeys.map((key) => (
            <button
              key={key}
              className={`mr-2 mb-2 px-2 py-1 border ${
                key === selectedTable ? "bg-blue-200" : ""
              }`}
              onClick={() => selectTable(key)}
              onDoubleClick={() => renameTable(key)}
            >
              {key}
            </button>
          ))}
          <button onClick={addTable} className="px-2 py-1 border bg-green-200">
            + 테이블
          </button>
          {selectedTable && (
            <button
              onClick={() => removeTable(selectedTable)}
              className="px-2 py-1 border bg-red-200 ml-1"
            >
              삭제
            </button>
          )}
        </div>

        {/* 선택 테이블 표시 */}
        {selectedTable && (
          <div className="overflow-auto max-h-[400px] border p-1">
            <table className="table-auto border-collapse border w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(manager.getTable(selectedTable)?.[0] || {}).map(
                    (col) => (
                      <th key={col} className="border px-2 py-1">
                        {col}{" "}
                        <button
                          onClick={() => removeColumn(col)}
                          className="text-red-500 ml-1"
                        >
                          x
                        </button>
                      </th>
                    )
                  )}
                  <th className="border px-2 py-1">
                    <button onClick={addColumn} className="bg-green-200 px-1">
                      + 컬럼
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {manager.getTable(selectedTable)?.map((row, i) => (
                  <tr key={i} className="border">
                    {Object.keys(row).map((col) => (
                      <td key={col} className="border px-2 py-1">
                        <input
                          value={row[col]}
                          onChange={(e) => updateCell(i, col, e.target.value)}
                          className="w-full border-none outline-none"
                        />
                      </td>
                    ))}
                    <td className="border px-2 py-1">
                      <button
                        onClick={() => removeRow(i)}
                        className="bg-red-200 px-1"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addRow} className="bg-green-200 px-2 py-1 mt-1">
              + 행
            </button>
          </div>
        )}

        {/* 완료 버튼 */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => onCancel?.()}
            className="px-4 py-2 border bg-gray-300"
          >
            닫기
          </button>
          <button
            onClick={() => {
              // internalData가 비어 있으면 기본 테이블을 하나 생성
              const safeData =
                internalData && Object.keys(internalData).length > 0
                  ? internalData
                  : { table1: [] };

              onConfirm(safeData);
            }}
            className="px-4 py-2 border bg-blue-300"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};
