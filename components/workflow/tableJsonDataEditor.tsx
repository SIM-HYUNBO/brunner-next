import React, { useState, useEffect } from "react";
import { TableJsonDataManager } from "@/components/workflow/tableJsonDataManager";

import type { JsonObject } from "@/components/workflow/tableJsonDataManager";

interface TableJsonDataEditorProps {
  manager: TableJsonDataManager;
  readData?: string | Record<string, JsonObject[]>;
}

export const TableJsonDataEditor: React.FC<TableJsonDataEditorProps> = ({
  manager,
  readData,
}) => {
  const [tableKeys, setTableKeys] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<JsonObject[]>([]);
  const [displayData, setDisplayData] = useState<string>("");

  useEffect(() => {
    const keys: string[] = Object.keys(manager.getData());
    setTableKeys(keys);
    if (keys.length > 0 && !selectedTable && keys[0]) setSelectedTable(keys[0]);
  }, [manager, selectedTable]);

  useEffect(() => {
    if (!selectedTable) return;
    const table = manager.getTable(selectedTable) ?? [];
    setRows([...table]);
  }, [manager, selectedTable]);

  useEffect(() => {
    if (!readData) return;
    let text: string;
    if (typeof readData === "string") {
      try {
        text = JSON.stringify(JSON.parse(readData), null, 2);
      } catch {
        text = readData;
      }
    } else {
      text = JSON.stringify(readData, null, 2);
    }
    setDisplayData(text);
  }, [readData]);

  const addTable = () => {
    const name = prompt("추가할 테이블 이름:");
    if (!name) return;
    manager.addTable(name);
    setTableKeys([...Object.keys(manager.getData())]);
    setSelectedTable(name);
  };

  const removeTable = (name: string) => {
    if (!window.confirm(`${name} 테이블을 삭제하시겠습니까?`)) return;
    manager.removeTable(name);
    const keys = Object.keys(manager.getData());
    setTableKeys(keys);
    setSelectedTable(keys[0] || null);
  };

  const renameTable = (oldName: string) => {
    const newName = prompt("새 테이블 이름:", oldName);
    if (!newName || newName === oldName) return;
    manager.renameTable(oldName, newName);
    setTableKeys([...Object.keys(manager.getData())]);
    setSelectedTable(newName);
  };

  const addColumn = () => {
    if (!selectedTable) return;
    const colName = prompt("추가할 컬럼 이름:");
    if (!colName) return;
    manager.addColumn(selectedTable, colName);
    setRows([...manager.getTable(selectedTable)!]);
  };

  const removeColumn = (colName: string) => {
    if (!selectedTable) return;
    if (!window.confirm(`${colName} 컬럼을 삭제하시겠습니까?`)) return;
    manager.removeColumn(selectedTable, colName);
    setRows([...manager.getTable(selectedTable)!]);
  };

  const renameColumn = (oldName: string) => {
    if (!selectedTable) return;
    const newName = prompt("새 컬럼 이름:", oldName);
    if (!newName || newName === oldName) return;
    manager.renameColumn(selectedTable, oldName, newName);
    setRows([...manager.getTable(selectedTable)!]);
  };

  const addRow = () => {
    if (!selectedTable) return;
    const firstRow = rows[0] || {};
    const newRow: JsonObject = {};
    Object.keys(firstRow).forEach((k) => (newRow[k] = ""));
    setRows([...rows, newRow]);
    manager.addRow(selectedTable, newRow);
  };

  const removeRow = (index: number) => {
    if (!selectedTable) return;
    setRows(rows.filter((_, i) => i !== index));
    manager.removeRow(selectedTable, index);
  };

  const updateCell = (rowIndex: number, key: string, value: any) => {
    if (!selectedTable) return;
    const newRows = [...rows];

    if (newRows[rowIndex]) newRows[rowIndex][key] = value;

    setRows(newRows);

    if (newRows[rowIndex])
      manager.updateRow(selectedTable, rowIndex, newRows[rowIndex]);
  };

  const exportData = (asString: boolean = true) => {
    const data = manager.getData();
    const result = asString ? JSON.stringify(data, null, 2) : data;
    setDisplayData(JSON.stringify(result, null, 2));
    return result;
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div
        style={{
          minWidth: 180,
          borderRight: "1px solid #ccc",
          paddingRight: 10,
        }}
      >
        <h3>테이블 목록</h3>
        <button onClick={addTable}>테이블 추가</button>
        <ul style={{ marginTop: 10 }}>
          {tableKeys.map((key) => (
            <li key={key} style={{ marginBottom: 5 }}>
              <span
                style={{
                  cursor: "pointer",
                  fontWeight: selectedTable === key ? "bold" : "normal",
                }}
                onClick={() => setSelectedTable(key)}
              >
                {key}
              </span>
              <button
                style={{ marginLeft: 5 }}
                onClick={() => renameTable(key)}
              >
                이름 변경
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 20 }}>
          <button onClick={() => exportData(true)}>문자열 내보내기</button>
          <button onClick={() => exportData(false)} style={{ marginLeft: 10 }}>
            객체 내보내기
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {selectedTable && (
          <div>
            <h3>{selectedTable}</h3>
            <button onClick={addColumn}>컬럼 추가</button>
            <button onClick={addRow} style={{ marginLeft: 5 }}>
              행 추가
            </button>

            <table border={1} cellPadding={5} style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  {rows[0] &&
                    Object.keys(rows[0]).map((col) => (
                      <th key={col}>
                        {col}{" "}
                        <button onClick={() => renameColumn(col)}>이름</button>
                        <button onClick={() => removeColumn(col)}>삭제</button>
                      </th>
                    ))}
                  <th>행 삭제</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {Object.keys(row).map((col) => (
                      <td key={col}>
                        <input
                          type="text"
                          value={row[col]}
                          onChange={(e) =>
                            updateCell(rIdx, col, e.target.value)
                          }
                        />
                      </td>
                    ))}
                    <td>
                      <button onClick={() => removeRow(rIdx)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {displayData && (
          <div style={{ marginTop: 20 }}>
            <h3>데이터 미리보기</h3>
            <pre
              style={{
                maxHeight: 300,
                overflowY: "auto",
                background: "#f5f5f5",
                padding: 10,
                border: "1px solid #ddd",
              }}
            >
              {displayData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
