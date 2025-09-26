import React, { useState, useRef, useEffect } from "react";
import type {
  DatasetColumn,
  NodeDataTable,
} from "@/components/workflow/actionRegistry";

interface OutputModalProps {
  outputs: NodeDataTable[];
  onChange: (outputs: NodeDataTable[]) => void;
  onClose: () => void;
}

export default function NodeOutputParameterModal({
  outputs,
  onChange,
  onClose,
}: OutputModalProps) {
  const [localOutputs, setLocalOutputs] = useState<NodeDataTable[]>(outputs);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const modalRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  /** 컬럼 추가 */
  const addColumn = (tableIndex: number) => {
    const updated = [...localOutputs];
    updated[tableIndex]?.columns.push({
      key: `column${Date.now()}`,
      type: "string",
    });
    setLocalOutputs(updated);
  };

  /** 컬럼 수정 */
  const updateColumn = (
    tableIndex: number,
    columnIndex: number,
    field: keyof DatasetColumn,
    value: any
  ) => {
    const updated = [...localOutputs];
    const updatedTable = updated[tableIndex];
    if (!updatedTable) return;

    const currentColumn = updatedTable.columns[columnIndex] ?? {
      key: "",
      type: "string",
      value: null,
    };

    updatedTable.columns[columnIndex] = {
      ...currentColumn,
      [field]: value,
    };
    setLocalOutputs(updated);
  };

  /** 컬럼 삭제 */
  const removeColumn = (tableIndex: number, columnIndex: number) => {
    const updated = [...localOutputs];
    updated[tableIndex]?.columns.splice(columnIndex, 1);
    setLocalOutputs(updated);
  };

  /** 저장 */
  const save = () => {
    onChange(localOutputs);
    onClose();
  };

  /** 크기 조절 */
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
  };

  const resize = (e: MouseEvent) => {
    if (isResizing.current && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setSize({
        width: Math.max(400, e.clientX - rect.left),
        height: Math.max(300, e.clientY - rect.top),
      });
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white p-4 rounded shadow-lg relative flex flex-col"
        style={{ width: size.width, height: size.height }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">출력 파라미터 설정</h2>
        <div className="flex-1 overflow-auto">
          {localOutputs.map((table, tableIndex) => (
            <div key={table.table} className="mb-4 border p-2 rounded">
              <h3 className="font-bold mb-2">{table.table}</h3>
              {table.columns.map((col, colIndex) => (
                <div key={col.key} className="flex items-center mb-2 space-x-2">
                  <input
                    type="text"
                    className="border px-2 py-1 flex-1"
                    value={col.key}
                    placeholder="Column Key"
                    onChange={(e) =>
                      updateColumn(tableIndex, colIndex, "key", e.target.value)
                    }
                  />
                  <select
                    value={col.type}
                    className="border px-2 py-1"
                    onChange={(e) =>
                      updateColumn(
                        tableIndex,
                        colIndex,
                        "type",
                        e.target.value as DatasetColumn["type"]
                      )
                    }
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                  </select>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => removeColumn(tableIndex, colIndex)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => addColumn(tableIndex)}
              >
                + 컬럼 추가
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2">
          <button
            onClick={save}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            닫기
          </button>
        </div>

        <div
          onMouseDown={startResizing}
          className="absolute bottom-0 right-0 w-4 h-4 bg-gray-500 cursor-se-resize"
        />
      </div>
    </div>
  );
}
