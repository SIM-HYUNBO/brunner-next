import React, { useState, useEffect } from "react";
import type {
  NodeInputField,
  NodeOutputField,
} from "@/components/workflow/actionRegistry";
import type { WorkflowVariable } from "@/components/workflow/variableBrowser";
import * as actionRegistry from "@/components/workflow/actionRegistry";
import { useModal } from "@/components/core/client/brunnerMessageBox";

export interface InputMappingModalProps {
  isOpen: boolean; // 모달 열림 여부
  actionName?: string; // 노드 액션 이름
  inputs: NodeInputField[]; // 입력 정보
  outputs?: NodeOutputField[]; // 출력 정보
  workflowVariables: WorkflowVariable[]; // 변수 후보 목록
  onSave: (inputs: NodeInputField[], outputs: NodeOutputField[]) => void;
  onClose: () => void;
}

export const NodeInputParameterModal: React.FC<InputMappingModalProps> = ({
  isOpen,
  actionName = "",
  inputs,
  outputs = [],
  workflowVariables,
  onSave,
  onClose,
}) => {
  const { BrunnerMessageBox, openModal } = useModal();
  const [localInputs, setLocalInputs] = useState<NodeInputField[]>([]);
  const [localOutputs, setLocalOutputs] = useState<NodeOutputField[]>([]);
  const [selectedInputIdx, setSelectedInputIdx] = useState<number | null>(null);

  // 모달이 열릴 때 초기값 동기화
  useEffect(() => {
    setLocalInputs([...inputs]);
    setLocalOutputs([...outputs]);
    setSelectedInputIdx(null);
  }, [inputs, outputs, isOpen]);

  // 값 변경
  const handleValueChange = (idx: number, value: any) => {
    setLocalInputs((prev: any) =>
      prev.map((input: any, i: any) =>
        i === idx
          ? { ...input, value, sourceNodeId: undefined, type: "direct" }
          : input
      )
    );
  };

  // 바인딩
  const bindInput = (index: number, variableId: string) => {
    setLocalInputs((prev: any) =>
      prev.map((inp: any, i: any) =>
        i === index ? { ...inp, type: "ref", sourceNodeId: variableId } : inp
      )
    );
  };

  // 바인딩 해제
  const unbindInput = (index: number) => {
    setLocalInputs((prev: any) =>
      prev.map((inp: any, i: any) => {
        if (i !== index) return inp;
        const defaults = actionRegistry.getDefaultInputs?.(actionName) ?? [];
        const def = defaults.find((d) => d.key === inp.key);
        return {
          ...inp,
          type: "direct",
          sourceNodeId: undefined,
          value: def ? def.value : "",
        };
      })
    );
  };

  const handleSave = () => {
    onSave(localInputs, localOutputs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <BrunnerMessageBox />
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
        <div className="bg-white w-3/4 h-3/4 rounded shadow-lg p-4 flex flex-col">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Input Mapping – {actionName}</h3>
            <button className="text-red-500 font-bold" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 좌우 레이아웃 */}
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* 왼쪽: Input 목록 */}
            <div className="flex-1 border rounded overflow-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1">Input</th>
                    <th className="px-2 py-1">Value / Binding</th>
                  </tr>
                </thead>
                <tbody>
                  {localInputs.map((input, idx) => (
                    <tr
                      key={idx}
                      className={`cursor-pointer ${
                        selectedInputIdx === idx ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedInputIdx(idx)}
                    >
                      <td className="border px-2 py-1">{input.key}</td>
                      <td className="border px-2 py-1">
                        {input.type === "ref" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">
                              {input.sourceNodeId}
                            </span>
                            <button
                              className="text-red-500 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                unbindInput(idx);
                              }}
                            >
                              Unbind
                            </button>
                          </div>
                        ) : (
                          <input
                            className="border px-1 w-full"
                            value={input.value ?? ""}
                            onChange={(e) =>
                              handleValueChange(idx, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 오른쪽: 변수 브라우저 */}
            {/* 오른쪽: 변수 브라우저 */}
            <div className="w-1/2 border p-2 overflow-y-auto rounded">
              <h4 className="font-bold mb-2">Available Variables</h4>
              {workflowVariables.length === 0 ? (
                <p className="text-gray-500 text-sm">No variables available</p>
              ) : (
                <table className="table-auto w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 border">Key</th>
                      <th className="px-2 py-1 border">Node</th>
                      <th className="px-2 py-1 border">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowVariables.map((v, idx) => (
                      <tr
                        key={v.key + idx}
                        className={`cursor-pointer ${
                          selectedInputIdx === idx ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          if (selectedInputIdx != null) {
                            bindInput(selectedInputIdx, v.key);
                          } else {
                            openModal(
                              "Select Input variable for mapping first."
                            );
                          }
                        }}
                      >
                        <td className="border px-2 py-1">{v.key}</td>
                        <td className="border px-2 py-1">{v.nodeId}</td>
                        <td className="border px-2 py-1">{v.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-4 flex justify-end gap-2">
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
