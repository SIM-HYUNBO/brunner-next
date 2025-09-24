import React, { useState } from "react";
import type { NodeOutputField } from "./actionRegistry";

interface OutputModalProps {
  outputs: NodeOutputField[];
  onChange: (outputs: NodeOutputField[]) => void;
  onClose: () => void;
}

export default function NodeOutputParameterModal({
  outputs,
  onChange,
  onClose,
}: OutputModalProps) {
  const [localOutputs, setLocalOutputs] = useState<NodeOutputField[]>(outputs);

  const addOutput = () => {
    setLocalOutputs([...localOutputs, { key: "", type: "string" }]);
  };

  const updateOutput = (
    index: number,
    field: keyof NodeOutputField,
    value: string
  ) => {
    const updated: any = [...localOutputs];
    updated[index] = { ...updated[index], [field]: value };
    setLocalOutputs(updated);
  };

  const removeOutput = (index: number) => {
    const updated = [...localOutputs];
    updated.splice(index, 1);
    setLocalOutputs(updated);
  };

  const save = () => {
    onChange(localOutputs);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-xl p-4 w-1/3 shadow-xl">
        <h3 className="text-lg font-bold mb-4">출력 파라미터 편집</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {localOutputs.map((out, idx) => (
            <div key={idx} className="flex gap-2 px-4">
              <input
                className="flex-1 border p-1 rounded"
                value={out.key}
                placeholder="Key"
                onChange={(e) => updateOutput(idx, "key", e.target.value)}
              />
              <select
                className="border p-1 rounded"
                value={out.type}
                onChange={(e) => updateOutput(idx, "type", e.target.value)}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
              </select>
              <button
                className="text-red-500 font-bold"
                onClick={() => removeOutput(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={addOutput}>
            + 추가
          </button>
          <div className="space-x-2">
            <button className="px-3 py-1 rounded border" onClick={onClose}>
              취소
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={save}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
