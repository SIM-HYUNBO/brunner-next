import React, { useState, useEffect } from "react";
import type {
  NodeInputField,
  NodeOutputField,
} from "@/components/workflow/workflowEditor";
import * as actionRegistry from "@/components/workflow/actionRegistry";

interface InputMappingModalProps {
  isOpen: boolean;
  actionName?: string; // 초기 액션 이름
  inputs: NodeInputField[];
  outputs: NodeOutputField[];
  workflowVariables: any[]; // 수동 바인딩 후보
  onClose: () => void;
  onSave: (inputs: NodeInputField[], outputs: NodeOutputField[]) => void;
}

export const InputMappingModal: React.FC<InputMappingModalProps> = ({
  isOpen,
  actionName = "",
  inputs,
  outputs,
  workflowVariables,
  onClose,
  onSave,
}) => {
  const [selectedAction, setSelectedAction] = useState(actionName);
  const [localInputs, setLocalInputs] = useState<NodeInputField[]>([...inputs]);
  const [localOutputs, setLocalOutputs] = useState<NodeInputField[]>([
    ...(outputs ?? []),
  ]);
  const [autoCandidates, setAutoCandidates] = useState<
    Record<number, string[]>
  >({});

  useEffect(() => {
    if (!isOpen) return;
    setSelectedAction(actionName || "");
  }, [isOpen, actionName || ""]);

  useEffect(() => {
    // 액션 유형별 기본값
    const defaultInputs =
      actionRegistry.getDefaultInputs?.(selectedAction) ?? [];
    const defaultOutputs =
      actionRegistry.getDefaultOutputs?.(selectedAction) ?? [];
    setLocalInputs(inputs.length ? inputs : inputs);
    setLocalOutputs(outputs.length ? outputs : outputs);

    // 각 input에 대해 자동 후보 생성 (여기선 예시로 type이 'ref'인 경우)
    const auto: Record<number, string[]> = {};
    defaultInputs.forEach((input, idx) => {
      if (input.type === "ref") {
        // 예시: 워크플로우 내 변수 중 이름과 key가 같으면 자동 후보
        auto[idx] = workflowVariables.filter((v) => v.includes(input.key));
      }
    });
    setAutoCandidates(auto);
  }, [selectedAction, inputs, workflowVariables]);

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
      <div className="bg-white rounded-lg w-[700px] max-h-[80vh] overflow-auto p-5">
        <h2 className="text-xl font-bold mb-3">Input Mapping</h2>

        <div className="mb-3">
          <label>Action Type:</label>
          <input
            className="w-full border px-2 py-1 mt-1 bg-gray-100 cursor-not-allowed"
            value={selectedAction}
            disabled
          />
        </div>

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
              {localInputs.map((input, idx) => {
                const candidates =
                  input.type === "ref"
                    ? autoCandidates[idx] || workflowVariables
                    : [];
                return (
                  <tr key={idx}>
                    <td className="border px-2 py-1">
                      <input
                        className="w-full border px-1 py-0.5"
                        value={input.key}
                        onChange={(e) =>
                          updateInput(idx, "key", e.target.value)
                        }
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
                        <input
                          className="w-full border px-1 py-0.5"
                          value={input.value ?? ""}
                          onChange={(e) =>
                            updateInput(idx, "value", e.target.value)
                          }
                        />
                      ) : (
                        <select
                          className="w-full border px-1 py-0.5"
                          value={input.sourceNodeId ?? ""}
                          onChange={(e) =>
                            updateInput(idx, "sourceNodeId", e.target.value)
                          }
                        >
                          <option value="">-- Select Variable --</option>
                          {candidates?.map((v) => (
                            <option key={v.nodeId} value={v.nodeId}>
                              {v.key}
                            </option>
                          ))}
                        </select>
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
                );
              })}
            </tbody>
          </table>
          <button
            className="mt-2 bg-blue-200 px-3 py-1 rounded"
            onClick={addInput}
          >
            + Add Input
          </button>
        </details>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => onSave(localInputs, localOutputs)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
