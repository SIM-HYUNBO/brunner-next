import React, { useState, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";
import type { ScriptNodeDesignData } from "./types/nodeTypes";

interface ScriptEditorModalProps {
  open: boolean;
  scriptContents: string;
  scriptTimeoutMs: number;
  onConfirm: (data: ScriptNodeDesignData) => void;
  onClose: () => void;
  onHelp: () => void;
}

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  open,
  scriptContents,
  scriptTimeoutMs,
  onConfirm,
  onClose,
  onHelp,
}) => {
  const [internalScript, setInternalScript] = useState(scriptContents);
  const [internalTimeout, setInternalTimeout] = useState(scriptTimeoutMs);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(500);
  const [position, setPosition] = useState({
    x: (window?.innerWidth - width) / 2,
    y: (window?.innerHeight - height) / 2,
  });

  const isResizing = useRef(false);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setWidth((w) => Math.max(400, w + dx));
        setHeight((h) => Math.max(300, h + dy));
        lastPos.current = { x: e.clientX, y: e.clientY };
      } else if (isDragging.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setPosition((pos) => ({
          x: pos.x + dx,
          y: pos.y + dy,
        }));
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      isDragging.current = false;
      document.body.style.userSelect = "";
    };

    if (!window) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleSave = () => {
    const data: ScriptNodeDesignData = {
      scriptContents: internalScript,
      scriptTimeoutMs: internalTimeout,
    };

    onConfirm(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div
        className="semi-text-bg-color rounded shadow-lg flex flex-col border border-gray-400"
        style={{
          width,
          height,
          position: "absolute",
          left: position.x,
          top: position.y,
          minWidth: 400,
          minHeight: 300,
        }}
      >
        {/* 제목바 (드래그 이동 가능) */}
        <div
          className="semi-text-bg-color font-bold p-2 border-b bg-gray-200 cursor-move select-none"
          onMouseDown={(e) => {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none"; // 드래그 중 텍스트 선택 방지
          }}
        >
          Edit Script
        </div>

        {/* 본문 */}
        <div className="semi-text-bg-color flex-1 p-2 flex flex-col overflow-hidden">
          <label className="block mt-1 text-sm font-semibold">Script:</label>
          <div className="flex-1 border rounded overflow-hidden">
            <CodeMirror
              value={internalScript}
              height="100%"
              extensions={[javascript()]}
              theme={getIsDarkMode() ? githubDark : githubLight} // ✅ 이렇게만 사용
              onChange={(value) => setInternalScript(value)}
              className="w-full h-full"
            />
          </div>

          <label className="block mt-2 text-sm font-semibold">
            Timeout (ms):
          </label>
          <input
            type="number"
            className="w-32 p-1 border rounded"
            value={internalTimeout}
            onChange={(e) => setInternalTimeout(Number(e.target.value))}
          />
        </div>

        {/* 버튼들 */}
        <div className="semi-text-bg-color p-2 flex justify-end gap-2 border-t">
          <button
            className="px-3 py-1 border rounded general-text-bg-color"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="px-3 py-1 border rounded medium-text-bg-color"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-3 py-1 border rounded medium-text-bg-color"
            onClick={onHelp}
          >
            Help
          </button>
        </div>

        {/* 리사이즈 핸들 */}
        <div
          onMouseDown={(e) => {
            isResizing.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            document.body.style.userSelect = "none";
          }}
          style={{
            width: 18,
            height: 18,
            position: "absolute",
            right: 0,
            bottom: 0,
            cursor: "nwse-resize",
            background:
              "linear-gradient(135deg, transparent 40%, gray 40%, gray 60%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
};
