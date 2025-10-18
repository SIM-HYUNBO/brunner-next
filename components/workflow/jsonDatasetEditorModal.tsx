import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { JsonDatasetManager } from "@/components/workflow/jsonDatasetManager";
import type { JsonObject } from "@/components/workflow/jsonDatasetManager";
import * as ReactWindow from "react-window";

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
  autoFocus?: boolean;
}> = ({ initialValue, colType, onUpdate, autoFocus }) => {
  const [cellValue, setCellValue] = useState(String(initialValue));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();

      // input type="text" 또는 textarea에서만 selection 설정
      if (
        inputRef.current instanceof HTMLInputElement &&
        inputRef.current.type !== "number"
      ) {
        const len = inputRef.current.value.length;
        inputRef.current.selectionStart = len;
        inputRef.current.selectionEnd = len;
      }
    }
  }, [autoFocus]);
  const commitChange = () => {
    let parsed: any = cellValue;
    if (colType === "number") parsed = Number(cellValue) || 0;
    if (colType === "boolean") parsed = cellValue === "true";
    onUpdate(parsed);
  };

  if (colType === "boolean") {
    return (
      <select
        ref={inputRef as any}
        value={String(cellValue)}
        onChange={(e) => {
          setCellValue(e.target.value);
          onUpdate(e.target.value === "true");
        }}
        className="w-full border-none outline-none general-text-bg-color"
      >
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }

  return (
    <input
      ref={inputRef as any}
      type={colType === "number" ? "number" : "text"}
      value={cellValue}
      onChange={(e) => setCellValue(e.target.value)}
      onBlur={commitChange}
      onKeyDown={(e) => e.key === "Enter" && commitChange()}
      className="w-full border-none outline-none general-text-bg-color"
      autoFocus={autoFocus}
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
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );

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

  /* ---------------- Resize ---------------- */
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [resizing, setResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  const onResize = (e: MouseEvent) => {
    if (!resizing) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    setSize({
      width: Math.max(400, resizeStart.current.width + dx),
      height: Math.max(300, resizeStart.current.height + dy),
    });
  };

  const stopResize = () => setResizing(false);

  useEffect(() => {
    if (window && resizing) {
      window.addEventListener("mousemove", onResize);
      window.addEventListener("mouseup", stopResize);
    } else {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", stopResize);
    }
    return () => {
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [resizing]);

  /* ---------------- 초기화 ---------------- */
  useEffect(() => {
    const initData: Record<string, JsonObject[]> = {};
    Object.entries(value).forEach(([tableName, arr]: any) => {
      if (Array.isArray(arr)) initData[tableName] = arr as JsonObject[];
    });
    const newManager = new JsonDatasetManager(initData);
    setManager(newManager);
    setInternalData(initData);
    setSelectedTable(Object.keys(initData)[0] || null);
    // 기본 컬럼 폭 초기화
    const firstTableCols = Object.keys(
      initData[Object.keys(initData)[0] || ""]?.[0] || {}
    );
    const widths: { [key: string]: number } = {};
    firstTableCols.forEach((col) => (widths[col] = 120));
    setColumnWidths(widths);

    if (window)
      setPos({
        x: window.innerWidth / 2 - size.width / 2,
        y: window.innerHeight / 2 - size.height / 2,
      });
  }, [value]);

  /* ---------------- 유틸 ---------------- */
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
    setColumnWidths((prev) => ({ ...prev, [name]: 120 }));
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
    setColumnWidths((prev) => {
      const copy = { ...prev };
      delete copy[colKey];
      return copy;
    });
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

  /* ---------------- TableVirtualized ---------------- */
  const List = ReactWindow.FixedSizeList;

  function TableVirtualized({
    rows,
    columns,
    height,
    updateCell,
    removeRow,
  }: any) {
    const resizeColStart = useRef<{
      colName: string;
      startX: number;
      startWidth: number;
    } | null>(null);

    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [selectedCell, setSelectedCell] = useState<{
      rowIndex: number;
      colName: string;
    } | null>(null);

    /* ---------- 컬럼 리사이즈 ---------- */
    const startResizeCol = (e: React.MouseEvent, colName: string) => {
      e.preventDefault();
      e.stopPropagation();
      resizeColStart.current = {
        colName,
        startX: e.clientX,
        startWidth: columnWidths[colName] || 120,
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!resizeColStart.current) return;
        const dx = e.clientX - resizeColStart.current.startX;
        setColumnWidths((prev) => ({
          ...prev,
          [resizeColStart.current!.colName]: Math.max(
            minColWidth,
            resizeColStart.current!.startWidth + dx
          ),
        }));
      };

      const onMouseUp = () => {
        resizeColStart.current = null;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    /* ---------- 행 선택 ---------- */
    const handleRowClick = (e: React.MouseEvent, index: number) => {
      if (e.ctrlKey || e.metaKey) {
        setSelectedRows((prev) =>
          prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index]
        );
      } else if (e.shiftKey && selectedRows.length > 0) {
        const last = selectedRows[selectedRows.length - 1];
        const [start, end] = last! < index ? [last, index] : [index, last];
        const range = Array.from(
          { length: end! - start! + 1 },
          (_, i) => start! + i
        );
        setSelectedRows(range);
      } else {
        // 단일 클릭은 편집용 — 행 선택 안함
        setSelectedRows([]);
      }
    };

    /* ---------- 셀 클릭 ---------- */
    const handleCellClick = (
      rowIndex: number,
      colName: string,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      setSelectedCell({ rowIndex, colName });
    };

    /* ---------- 복사 (Ctrl+C) ---------- */
    const handleCopy = async () => {
      const activeEl = document.activeElement;

      // 타입 가드: input 또는 textarea일 때만 selection 확인
      if (
        activeEl &&
        (activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement)
      ) {
        const start = activeEl.selectionStart ?? 0;
        const end = activeEl.selectionEnd ?? 0;
        if (start !== end) {
          // 선택 영역만 복사
          const selectedText = activeEl.value.substring(start, end);
          await navigator.clipboard.writeText(selectedText);
          return;
        }
      }

      // 선택된 행이 있는 경우 → 기존 행 복사
      if (selectedRows.length > 0) {
        const sorted = [...selectedRows].sort((a, b) => a - b);
        const text = sorted
          .map((i) =>
            columns.map((c: any) => rows[i]?.[c.name] ?? "").join("\t")
          )
          .join("\n");
        await navigator.clipboard.writeText(text);
        return;
      }

      // 셀만 선택된 경우 → 전체 값 복사
      if (selectedCell) {
        const { rowIndex, colName } = selectedCell;
        const cellValue = rows[rowIndex]?.[colName] ?? "";
        await navigator.clipboard.writeText(String(cellValue));
      }
    };

    /* ---------- 붙여넣기 (Ctrl+V) ---------- */
    const handlePaste = async () => {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const lines = text
        .trim()
        .split(/\r?\n/)
        .map((line) => line.split("\t"));

      if (lines.length === 0) return;

      const newData = [...rows];

      if (selectedRows.length > 0) {
        // ✅ 여러 행 붙여넣기
        let startIndex = selectedRows[0];
        if (startIndex === undefined || startIndex === null) return;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const targetIndex = startIndex + i;
          const newRow: any = {};

          columns.forEach((c: any, j: any) => {
            newRow[c.name] = line![j] ?? "";
          });

          if (targetIndex < newData.length) newData[targetIndex] = newRow;
          else newData.push(newRow);
        }
      } else if (selectedCell) {
        // ✅ 단일 셀 붙여넣기
        const { rowIndex, colName } = selectedCell;
        const pastedValue = lines[0]![0]; // 첫 셀 값만
        updateCell(rowIndex, colName, pastedValue);
        return;
      } else {
        // ✅ 아무 선택 없으면 맨 끝에 추가
        const newRow: any = {};
        columns.forEach((c: any, j: any) => {
          newRow[c.name] = lines[0]![j] ?? "";
        });
        newData.push(newRow);
      }

      // 반영
      newData.forEach((r, i) => manager.updateRow(selectedTable!, i, r));
      setInternalData({ ...manager.getData() });
    };

    /* ---------- 단축키 등록 ---------- */
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key.toLowerCase() === "c") {
            e.preventDefault();
            handleCopy();
          } else if (e.key.toLowerCase() === "v") {
            e.preventDefault();
            handlePaste();
          }
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedRows, selectedCell, rows, columns]);

    /* ---------- 렌더 ---------- */
    return (
      <>
        {/* Header */}
        <div className="flex semi-text-bg-color border-b select-none">
          <div
            className=" flex items-center justify-center text-center"
            style={{ width: minColWidth }}
          >
            # (of {rows.length})
          </div>
          {columns.map((col: any) => (
            <div
              key={col.name}
              className="border px-5 flex text-center justify-center items-center"
              style={{
                width: columnWidths[col.name] || 150,
                minWidth: minColWidth,
              }}
            >
              <span className="flex-1">{col.name}</span>
              <div
                className="w-1 h-full cursor-col-resize semi-text-bg-color"
                onMouseDown={(e) => startResizeCol(e, col.name)}
              />
            </div>
          ))}
          <div className="border px-2 py-1">Action</div>
        </div>

        {/* Body */}
        <List
          height={height}
          itemCount={rows.length}
          itemSize={35}
          width={size.width - 16}
        >
          {({ index, style }) => {
            const row = rows[index];
            const isSelected = selectedRows.includes(index);
            return (
              <div
                style={{
                  ...style,
                  backgroundColor: isSelected ? "#cce5ff" : "transparent",
                }}
                className="flex border-b w-full cursor-pointer"
                onClick={(e) => handleRowClick(e, index)}
              >
                <div
                  className="border px-2 py-1 flex items-center justify-center font-mono semi-text-bg-color user-select-text"
                  style={{ width: minColWidth }}
                >
                  {index + 1}
                </div>
                {columns.map((col: any) => {
                  const isCellSelected =
                    selectedCell?.rowIndex === index &&
                    selectedCell?.colName === col.name;
                  return (
                    <div
                      key={col.name}
                      className="border px-2 py-1 flex items-center"
                      style={{
                        width: columnWidths[col.name] || 150,
                        minWidth: minColWidth,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 이미 선택된 셀이면 상태 변경 안 함 → 재렌더 방지
                        if (
                          selectedCell?.rowIndex === index &&
                          selectedCell?.colName === col.name
                        )
                          return;
                        setSelectedCell({ rowIndex: index, colName: col.name });
                      }}
                    >
                      <CellEditor
                        initialValue={row[col.name]}
                        colType={col.type as JsonColumnType}
                        onUpdate={(val) => updateCell(index, col.name, val)}
                        autoFocus={
                          selectedCell?.rowIndex === index &&
                          selectedCell?.colName === col.name
                        }
                      />
                    </div>
                  );
                })}
                <div>
                  <button
                    className="border px-2 py-1 text-red-500"
                    onClick={() => removeRow(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          }}
        </List>
      </>
    );
  }

  /* ---------------- 렌더링 ---------------- */
  if (!open) return null;

  const columns = selectedTable ? manager.getColumns(selectedTable) ?? [] : [];
  const minColWidth = 100;

  return (
    <div className="fixed inset-0 z-50" onClick={onCancel}>
      <div
        ref={modalRef}
        className="semi-text-bg-color absolute shadow-lg flex flex-col "
        style={{
          left: pos.x,
          top: pos.y,
          width: size.width,
          height: size.height,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 (드래그 영역) */}
        <div
          className="flex medium-text-bg-color justify-between mb-2 cursor-move select-none px-2 py-1 flex-none"
          onMouseDown={startDrag}
        >
          <h3 className="font-semibold">
            JSON Dataset Editor ({mode === "schema" ? "Schema" : "Data"} Mode)
          </h3>
        </div>

        {/* 테이블 선택 버튼 */}
        <div className="flex mb-2 flex-wrap flex-none">
          {tableKeys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTable(key)}
              onDoubleClick={() => renameTable(key)}
              className={`mr-2 mb-2 px-2 py-1 border rounded ${
                key === selectedTable
                  ? "semi-text-bg-color"
                  : "general-text-bg-color"
              }`}
            >
              {key}
            </button>
          ))}
          {isSchemaMode && (
            <>
              <button
                onClick={addTable}
                className="px-2 py-1 border general-text-bg-color rounded h-8"
              >
                + Table
              </button>
              {selectedTable && (
                <button
                  onClick={() => removeTable(selectedTable)}
                  className="px-2 py-1 border semi-text-bg-color rounded ml-1 h-8"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>

        {/* 내용 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden border p-1">
          {selectedTable && (
            <>
              {isSchemaMode ? (
                <div className="flex-1 overflow-auto">
                  <table className="table-auto border-collapse border w-full text-sm">
                    <thead className="semi-text-bg-color">
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col.name}
                            className="border px-2 py-1 general-text-bg-color"
                            style={{ width: columnWidths[col.name] || 150 }}
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
                          <button onClick={addColumn} className="px-1">
                            + Column
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="general-text-bg-color">
                        {columns.map((col) => (
                          <td
                            key={col.name}
                            className="border px-2 py-1"
                            style={{ width: columnWidths[col.name] || 150 }}
                          >
                            {String(
                              getDefaultValue(col.type as JsonColumnType)
                            )}
                          </td>
                        ))}
                        <td className="border px-2 py-1"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <TableVirtualized
                  rows={manager.getTable(selectedTable) || []}
                  columns={columns}
                  height={
                    size.height -
                    40 - // 헤더
                    50 - // 테이블 버튼 영역
                    60 - // 하단 버튼
                    16 // padding 여유
                  }
                  columnWidths={columnWidths}
                  setColumnWidths={setColumnWidths}
                  updateCell={updateCell}
                  removeRow={removeRow}
                />
              )}
              {isDataMode && (
                <button
                  onClick={addRow}
                  className="px-2 py-1 mt-1 rounded semi-text-bg-color border"
                >
                  + Row
                </button>
              )}
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end mt-4 space-x-2 flex-none">
          <button
            onClick={() => onConfirm({ ...internalData })}
            className="medium-text-bg-color px-4 py-2 border semi-text-bg-color"
          >
            Apply
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border semi-text-bg-color"
          >
            Close
          </button>
        </div>

        {/* 모달 크기조절 핸들 */}
        <div
          onMouseDown={startResize}
          className="absolute w-4 h-4 bottom-0 right-0 cursor-se-resize"
        />
      </div>
    </div>
  );
};
