import React, { useState, useRef, useEffect } from "react";
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
  const [size, setSize] = useState({ width: 500, height: 400 }); // 모달 초기 크기
  const modalRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const addOutput = () =>
    setLocalOutputs([...localOutputs, { key: "", type: "string" }]);
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

  // 마우스 이벤트 처리
  const onMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setSize({
      width: Math.max(300, e.clientX - rect.left),
      height: Math.max(200, e.clientY - rect.top),
    });
  };

  const onMouseUp = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl flex flex-col relative"
        style={{ width: size.width, height: size.height }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">출력 파라미터 편집</h3>
          <button className="text-gray-500 font-bold" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 내용 영역 */}
        <div className="flex-1 overflow-y-auto p-4">
          {localOutputs.map((out, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
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

        {/* 하단 버튼 */}
        <div className="flex justify-between p-4 border-t">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={addOutput}>
            + 추가
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={save}
          >
            저장
          </button>
        </div>

        {/* 우하단 리사이저 핸들 */}
        <div
          className="w-4 h-4 bg-gray-400 absolute right-0 bottom-0 cursor-se-resize"
          onMouseDown={onMouseDown}
        />
      </div>
    </div>
  );
}
