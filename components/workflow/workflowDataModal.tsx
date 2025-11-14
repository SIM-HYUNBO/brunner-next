"use client";

import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import * as constants from "@/components/core/constants";
import { RequestServer } from "@/components/core/client/requestServer";
import { JsonViewer } from "@textea/json-viewer";
import copy from "copy-to-clipboard";
import { getIsDarkMode } from "@/components/core/client/frames/darkModeToggleButton";
import { Button, message } from "antd";
import * as userInfo from "@/components/core/client/frames/userInfo";

interface WorkflowDataModalProps {
  workflowId: string;
  currentNodeId?: string;
  open: boolean;
  onClose: () => void;
}

// 배열 인덱스 → %%i%% 변환 & 노드 배열 인덱스는 이름으로 치환
const pathToDotWithNames = (path: (string | number)[], workflowData: any) => {
  return path
    .map((p, idx) => {
      if (typeof p === "number") {
        const parentKey = path[idx - 1];
        if (parentKey === "nodes") {
          const node = workflowData?.nodes?.[p];
          return node?.data?.label || `%%i%%`; // <-- label 사용
        }
        return `%%i%%`;
      } else {
        return p;
      }
    })
    .join(".");
};

export const WorkflowDataModal: React.FC<WorkflowDataModalProps> = ({
  workflowId,
  currentNodeId,
  open,
  onClose,
}) => {
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>(
    constants.General.EmptyString
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchWorkflowData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_SELECT_WORKFLOW,
        workflowId: id,
        systemCode: userInfo.getCurrentSystemCode(),
      };
      const jResponse = await RequestServer(jRequest);
      if (jResponse.error_code === 0) {
        setWorkflowData(jResponse.workflow_data);
      } else {
        setError(jResponse.error_message || "워크플로우 조회 실패");
        setWorkflowData(null);
      }
    } catch (err) {
      setError("❌ 서버 요청 실패: " + String(err));
      setWorkflowData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && workflowId) fetchWorkflowData(workflowId);
    else {
      setWorkflowData(null);
      setError(null);
      setSelectedPath(constants.General.EmptyString);
    }
  }, [open, workflowId]);

  useEffect(() => {
    if (!containerRef.current || !workflowData || !currentNodeId) return;

    const scrollToNode = () => {
      const idSpans = Array.from(
        containerRef.current!.querySelectorAll('span[data-name="id"]')
      ) as HTMLElement[];
      const targetSpan = idSpans.find(
        (span) => span.textContent === currentNodeId
      );

      if (targetSpan) {
        const dataDiv = targetSpan
          .closest("li")
          ?.querySelector('[data-name="data"]') as HTMLElement | null;
        if (dataDiv) {
          dataDiv.scrollIntoView({ behavior: "smooth", block: "center" });
          dataDiv.style.backgroundColor = "rgba(255,255,0,0.2)";
          setTimeout(() => {
            dataDiv.style.transition = "background-color 1s";
            dataDiv.style.backgroundColor = "transparent";
          }, 1000);
        }
      } else setTimeout(scrollToNode, 50);
    };

    scrollToNode();
  }, [workflowData, currentNodeId]);

  const handleCopyPath = () => {
    if (selectedPath) {
      copy(selectedPath);
      message.success("노드 경로 복사됨");
    }
  };

  if (!open) return null;

  return (
    <Rnd
      default={{ x: 50, y: 50, width: 900, height: 600 }}
      minWidth={600}
      minHeight={400}
      bounds="window"
      className="rounded-lg shadow-lg  semi-text-bg-color flex flex-col z-[999]"
    >
      {/* 헤더 */}
      <div className="flex medium-text-bg-color justify-between items-center cursor-move p-2.5 rounded-t-lg">
        <h2 className="font-bold">
          Workflow JSON - {workflowId}
          {currentNodeId
            ? ` / Node: ${currentNodeId}`
            : constants.General.EmptyString}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              workflowData && copy(JSON.stringify(workflowData, null, 2))
            }
            className="semi-text-bg-color px-3 py-1 rounded border"
          >
            Copy JSON
          </Button>
          <Button
            onClick={onClose}
            className="general-text-bg-color px-3 py-1 rounded border"
          >
            Close
          </Button>
        </div>
      </div>

      {/* JSON 뷰어 */}
      <div
        ref={containerRef}
        className="overflow-y-auto flex-1 p-2.5 semi-text-bg-color"
      >
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {/* 선택 노드 경로 표시 */}
        {selectedPath && (
          <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
            <div className="general-text-bg-color border border-black text-sm font-mono truncate flex-1">
              {selectedPath}
            </div>
            <Button
              className="semi-text-bg-color border border-black"
              size="small"
              onClick={handleCopyPath}
            >
              Copy Path
            </Button>
          </div>
        )}

        {workflowData && (
          <JsonViewer
            className="general-text-bg-color"
            theme={getIsDarkMode() ? "dark" : "light"}
            value={workflowData}
            defaultInspectDepth={2}
            onSelect={(path, value) => {
              const dotPath = pathToDotWithNames(path, workflowData);
              setSelectedPath(dotPath);
            }}
          />
        )}
      </div>
    </Rnd>
  );
};
