import React, { useState, useRef, useEffect } from "react";

interface ScriptEditorModalProps {
  open: boolean;
  script: string;
  timeoutMs: number;
  onConfirm: (script: string, timeoutMs: number) => void;
  onCancel: () => void;
  onHelp: () => void;
}

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  open,
  script,
  timeoutMs,
  onConfirm,
  onCancel,
  onHelp,
}) => {
  const [internalScript, setInternalScript] = useState(script);
  const [internalTimeout, setInternalTimeout] = useState(timeoutMs);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(500);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setWidth((w) => Math.max(400, w + dx));
      setHeight((h) => Math.max(300, h + dy));
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white rounded flex flex-col"
        style={{
          width,
          height,
          minWidth: 400,
          minHeight: 300,
          maxWidth: "90vw",
          maxHeight: "90vh",
          position: "relative",
        }}
      >
        <h3 className="text-lg font-bold p-2 border-b">Edit Script</h3>

        <div className="flex-1 p-2 flex flex-col">
          <label className="block mt-1">Script:</label>
          <textarea
            className="flex-1 w-full p-2 border font-mono resize-none"
            value={internalScript}
            placeholder={`
const body = {
      title: "sim",
      body: "hyunbo",
      age: 50
  }

const response = await api.postJson("https://jsonplaceholder.typicode.com/posts",
                                     JSON.stringify(body));
api.alert(JSON.stringify(response));
`}
            onChange={(e) => setInternalScript(e.target.value)}
            onPaste={(e) => {
              e.stopPropagation();
            }}
          />

          <label className="block mt-2">Timeout (ms):</label>
          <input
            type="number"
            className="w-32 p-1 border"
            value={internalTimeout}
            onChange={(e) => setInternalTimeout(Number(e.target.value))}
          />
        </div>

        <div className="p-2 flex justify-end gap-2 border-t">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => onConfirm(internalScript, internalTimeout)}
          >
            OK
          </button>
          <button className="px-3 py-1 border rounded" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-3 py-1 border rounded" onClick={onHelp}>
            Help
          </button>
        </div>

        {/* Resizer */}
        <div
          ref={resizerRef}
          onMouseDown={(e) => {
            isResizing.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
          }}
          style={{
            width: 16,
            height: 16,
            position: "absolute",
            right: 0,
            bottom: 0,
            cursor: "nwse-resize",
            backgroundColor: "transparent",
          }}
        />
      </div>
    </div>
  );
};
