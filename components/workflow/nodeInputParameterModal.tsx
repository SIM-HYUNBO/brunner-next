import React, { useState, useEffect } from "react";
import type {
  DatasetColumnWithUI,
  NodeDataTableWithUI,
} from "@/components/workflow/actionRegistry";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface InputMappingModalProps {
  isOpen: boolean;
  actionName?: string;
  inputs: NodeDataTableWithUI[];
  onSave: (inputs: NodeDataTableWithUI[]) => void;
  onClose: () => void;
}

export const NodeInputParameterModal: React.FC<InputMappingModalProps> = ({
  isOpen,
  actionName = "",
  inputs,
  onSave,
  onClose,
}) => {
  const [localInputs, setLocalInputs] = useState<NodeDataTableWithUI[]>([]);

  useEffect(() => {
    setLocalInputs(
      (inputs ?? []).map((t) => ({
        ...t,
        columns: (t.columns ?? []).map((c) => ({
          key: c.key ?? `col${Math.random().toString(36).slice(2)}`,
          type: c.type ?? "string",
          value: c.value ?? "",
          bindingType: c.bindingType ?? "direct",
          sourceNodeId: c.sourceNodeId ?? "",
        })),
        value: t.value ?? [],
      }))
    );
  }, [inputs, isOpen]);

  /** 컬럼 값 변경 */
  const handleColumnValueChange = (
    tableIndex: number,
    columnIndex: number,
    value: any
  ) => {
    setLocalInputs((prev) => {
      const updated = [...prev];
      const table = updated[tableIndex];
      if (!table) return prev;

      if (!table.columns) table.columns = [];

      const col = table.columns[columnIndex] ?? {
        key: `col${Math.random().toString(36).slice(2)}`,
        type: "string",
        value: "",
        bindingType: "direct",
        sourceNodeId: "",
      };

      table.columns[columnIndex] = {
        ...col,
        value,
        bindingType: "direct",
        sourceNodeId: "",
      };

      return updated;
    });
  };

  /** 컬럼 바인딩 */
  const bindColumn = (
    tableIndex: number,
    columnIndex: number,
    sourceNodeId: string
  ) => {
    setLocalInputs((prev) => {
      const updated = [...prev];
      const table = updated[tableIndex];
      if (!table) return prev;

      if (!table.columns) table.columns = [];

      const col = table.columns[columnIndex];

      table.columns[columnIndex] = {
        key: col?.key ?? `col${columnIndex}`,
        type: col?.type ?? "string",
        value: col?.value ?? "",
        bindingType: "ref",
        sourceNodeId,
      };

      return updated;
    });
  };

  /** 컬럼 바인딩 해제 */
  const unbindColumn = (tableIndex: number, columnIndex: number) => {
    setLocalInputs((prev) => {
      const updated = [...prev];

      // table 유효성 체크
      const table = updated[tableIndex];
      if (!table) return prev;

      // columns 초기화
      if (!table.columns) table.columns = [];

      // 컬럼 기본값 처리
      const col = table.columns[columnIndex] ?? {
        key: `col${columnIndex}`,
        type: "string",
        value: "",
        bindingType: "direct",
        sourceNodeId: "",
      };

      table.columns[columnIndex] = {
        ...col,
        bindingType: "direct",
        sourceNodeId: "",
      };

      return updated;
    });
  };

  /** 새 테이블 추가 */
  const addInputTable = () => {
    const defaults = actionRegistry.getDefaultInputs?.(actionName) ?? [];

    const newTable: NodeDataTableWithUI = {
      table: defaults[0]?.table ?? `table${localInputs.length + 1}`,
      value: defaults[0]?.value ?? [],
      columns: (defaults[0]?.columns ?? []).map((c) => ({
        key: c.key ?? `col${Math.random().toString(36).slice(2)}`,
        type: c.type ?? "string",
        value: c.value ?? "",
        bindingType: "direct",
        sourceNodeId: "",
      })),
    };

    setLocalInputs((prev) => [...prev, newTable]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-4 w-4/5 h-4/5 overflow-auto">
        <h3 className="text-lg font-bold mb-2">Input Mapping – {actionName}</h3>

        {localInputs.map((table, tIdx) => (
          <div key={tIdx} className="mb-4 border p-2 rounded">
            <div className="font-semibold mb-2">{table.table}</div>
            {table.columns.map((col, cIdx) => (
              <div key={cIdx} className="flex items-center gap-2 mb-1">
                <span className="w-24">{col.key}</span>
                <input
                  className="border px-1 flex-1"
                  value={col.value ?? ""}
                  onChange={(e) =>
                    handleColumnValueChange(tIdx, cIdx, e.target.value)
                  }
                />
                {col.bindingType === "ref" ? (
                  <button
                    className="text-red-500"
                    onClick={() => unbindColumn(tIdx, cIdx)}
                  >
                    Unbind
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => onSave(localInputs)}
          >
            Save
          </button>
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={addInputTable}
          >
            + Table
          </button>
        </div>
      </div>
    </div>
  );
};
