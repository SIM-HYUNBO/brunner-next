import React, { useState, useEffect } from "react";
import type { NodeInputField } from "@/components/workflow/workflowEditor";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface InputMappingModalProps {
  isOpen: boolean;
  actionName?: string; // 현재 노드 유형 표시
  inputs: NodeInputField[];
  onClose: () => void;
  onSave: (inputs: NodeInputField[]) => void;
}

export const InputMappingModal: React.FC<InputMappingModalProps> = ({
  isOpen,
  actionName = "",
  inputs,
  onClose,
  onSave,
}) => {
  const [localInputs, setLocalInputs] = useState<NodeInputField[]>([...inputs]);
  const [selectedAction, setSelectedAction] = useState(actionName);

  // 노드 유형이 바뀌거나 모달이 열릴 때 기본값 초기화
  useEffect(() => {
    const defaults = actionRegistry.getDefaultInputs?.(selectedAction) ?? [];
    setLocalInputs(defaults.length ? defaults : inputs);
  }, [selectedAction, inputs]);

  const updateInput = (
    index: number,
    key: keyof NodeInputField,
    value: any
  ) => {
    setLocalInputs((prev) =>
      prev.map((input, i) => (i === index ? { ...input, [key]: value } : input))
    );
  };

  const addInput = () => {
    setLocalInputs((prev) => [...prev, { key: "", type: "direct", value: "" }]);
  };

  const removeInput = (index: number) => {
    setLocalInputs((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg p-5 max-h-[80vh] overflow-auto"
        style={{ width: "600px", minWidth: "400px", resize: "both" }}
      >
        <h2 className="text-xl font-bold mb-3">Input Mapping</h2>

        {/* 노드 유형 표시 (읽기 전용) */}
        <div className="mb-3">
          <label>Action Type:</label>
          <input
            type="text"
            className="w-full border px-2 py-1 mt-1 bg-gray-100"
            value={selectedAction}
            readOnly
          />
        </div>

        {/* Inputs 아코디언 + 테이블 */}
        <details open className="border rounded p-2">
          <summary className="cursor-pointer font-semibold">Inputs</summary>
          <table className="table-auto w-full mt-2 border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Key</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Value / Ref</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {localInputs.map((input, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full border px-1 py-0.5"
                      value={input.key}
                      onChange={(e) => updateInput(idx, "key", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <select
                      value={input.type}
                      onChange={(e) =>
                        updateInput(
                          idx,
                          "type",
                          e.target.value as NodeInputField["type"]
                        )
                      }
                    >
                      <option value="direct">Direct</option>
                      <option value="ref">Reference</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    {input.type === "direct" ? (
                      <textarea
                        className="w-full border px-1 py-1 resize-none"
                        rows={3}
                        value={
                          typeof input.value === "object"
                            ? JSON.stringify(input.value, null, 2)
                            : input.value ?? ""
                        }
                        onChange={(e) => {
                          let newValue: any;
                          try {
                            newValue = JSON.parse(e.target.value);
                          } catch {
                            newValue = e.target.value;
                          }
                          updateInput(idx, "value", newValue);
                        }}
                      />
                    ) : (
                      <input
                        className="w-full border px-1 py-0.5"
                        value={input.sourceNodeId ?? ""}
                        onChange={(e) =>
                          updateInput(idx, "sourceNodeId", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="text-red-500"
                      onClick={() => removeInput(idx)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-2 bg-blue-200 px-3 py-1 rounded"
            onClick={addInput}
          >
            + Add Input
          </button>
        </details>

        {/* 버튼 */}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => onSave(localInputs)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
