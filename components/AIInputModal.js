// components/eDoc/eDocAIInputModal.js
import React, { useState, useRef, useEffect } from "react";
import Loading from "@/components/loading";
import AIModelSelector from "@/components/eDoc/aiModelSelector";

export default function AIInputModal({ isOpen, onClose, onRequestToAIModel }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef(null);


  // 이동(드래그) 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 리사이즈 상태
  const MIN_WIDTH = 480;
  const MIN_HEIGHT = 360;
  const [size, setSize] = useState({ width: 900, height: 600 });
  const resizingRef = useRef(null);

  // 드래그 시작
  const handleMouseDown = (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
    if (e.target.dataset?.resizeHandle === "true") return;

    setDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
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

  // 리사이즈
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setDragging(false);
    resizingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  const handleResizeMouseMove = (e) => {
    if (!resizingRef.current) return;
    const dx = e.clientX - resizingRef.current.startX;
    const dy = e.clientY - resizingRef.current.startY;
    setSize({
      width: Math.max(MIN_WIDTH, resizingRef.current.startWidth + dx),
      height: Math.max(MIN_HEIGHT, resizingRef.current.startHeight + dy),
    });
  };

  const handleResizeMouseUp = () => {
    resizingRef.current = null;
    document.removeEventListener("mousemove", handleResizeMouseMove);
    document.removeEventListener("mouseup", handleResizeMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, []);

  const handleRequestToAIModel = async () => {
    if (!title.trim()) { setErrorMessage("문서 제목을 입력해주세요."); return; }
    if (!instructions.trim()) { setErrorMessage("문서 지시사항을 입력해주세요."); return; }
    if (!apiKey.trim()) { setErrorMessage("OpenAI API Key를 입력해주세요."); return; }

    setErrorMessage("");
    try {
      setLoading(true);
      await onRequestToAIModel({ title, instructions, apiKey, model });
    } catch (err) {
      console.error(err);
      setErrorMessage("문서를 생성하는 중 오류가 발생했습니다.");
    } finally { setLoading(false); }
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
                   p-6 rounded-2xl shadow-xl cursor-move overflow-hidden flex flex-col"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: `${MIN_WIDTH}px`,
          minHeight: `${MIN_HEIGHT}px`,
        }}
        onMouseDown={handleMouseDown}
        role="dialog"
        aria-modal="true"
        aria-label="Open AI Document Auto-generation"
      >
        <h2 className="text-xl font-bold mb-4 select-none">Open AI Document Auto-generation</h2>

        {errorMessage && <div className="mb-4 text-red-500 text-sm font-medium">{errorMessage}</div>}

        <label className="block mb-2 font-medium">OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="sk-xxxxxxxx"
        />

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
          className="w-full flex-grow border p-2 rounded mb-4 resize-none"
          placeholder="예: 목차는 개요, 현황, 전망으로 구성..."
        />

        <label className="block mb-2 font-medium">Select Model</label>
        <AIModelSelector model={model} setModel={setModel} apiKey={apiKey} />

        {model && <div className="mt-4">선택한 모델: <span className="font-mono">{model}</span></div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">닫기</button>
          <button onClick={handleRequestToAIModel} className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600">생성하기</button>
        </div>

        {/* 리사이즈 핸들 */}
        <div
          data-resize-handle="true"
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-2 right-2 w-4 h-4 cursor-se-resize bg-gray-400/60 dark:bg-gray-600/80 rounded-sm"
          title="Resize"
          aria-label="Resize"
        />
      </div>
    </div>
  );
}
