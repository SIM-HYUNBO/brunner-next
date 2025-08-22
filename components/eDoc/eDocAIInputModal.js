// components/eDoc/eDocAIInputModal.js
import React, { useState, useRef, useEffect } from "react";
import Loading from "@/components/loading";

export default function EDocAIInputModal({ isOpen, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [errorMessage, setErrorMessage] = useState(""); 
  const modalRef = useRef(null);

  // 드래그 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // 헤더 영역만 잡아서 드래그 가능하게 할 수도 있음
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT" || e.target.tagName === "BUTTON") return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage("문서 제목을 입력해주세요.");
      return;
    }
    if (!instructions.trim()) {
      setErrorMessage("문서 지시사항을 입력해주세요.");
      return;
    }
    if (!apiKey.trim()) {
      setErrorMessage("OpenAI API Key를 입력해주세요.");
      return;
    }

    setErrorMessage("");
    try {
      setLoading(true);
      await onSubmit({title, instructions, apiKey, model});
    } catch (err) {
      console.error(err);
      setErrorMessage("문서를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
      {loading && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/30">
          <Loading />
        </div>
      )}

      <div
        ref={modalRef}
        className="relative bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200
                   p-6 rounded-2xl w-[900px] shadow-xl cursor-move"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMouseDown={handleMouseDown}
      >
        <h2 className="text-xl font-bold mb-4">Open AI Document Auto-generation</h2>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mb-4 text-red-500 text-sm font-medium">{errorMessage}</div>
        )}

        {/* 입력 필드 */}
        <label className="block mb-2 font-medium">Document Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="예: 인공지능 기술 보고서"
        />

        <label className="block mb-2 font-medium">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          rows="4"
          placeholder="예: 목차는 개요, 현황, 전망으로 구성..."
        />

        <label className="block mb-2 font-medium">OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="sk-xxxxxxxx"
        />

        <label className="block mb-2 font-medium">Select Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="o1">o1</option>
          <option value="o1-mini">o1-mini</option>
          <option value="o3">o3</option>
          <option value="o3-mini">o3-mini</option>
          <option value="o3-pro">o3-pro</option>
          <option value="o4-mini">o4-mini</option>
          <option value="GPT-4.1">GPT-4.1</option>
          <option value="GPT-4.5">GPT-4.5</option>
          <option value="GPT-5">GPT-5</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600"
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
