"use client";

import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import * as constants from "@/components/core/constants";
import RequestServer from "@/components/core/client/requestServer";
import { JsonViewer } from "@textea/json-viewer";
import copy from "copy-to-clipboard";

interface WorkflowDataModalProps {
  workflowId: string;
  currentNodeId?: string;
  open: boolean;
  onClose: () => void;
}

export const WorkflowDataModal: React.FC<WorkflowDataModalProps> = ({
  workflowId,
  currentNodeId,
  open,
  onClose,
}) => {
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchWorkflowData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_SELECT_WORKFLOW,
        workflowId: id,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
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

  if (!open) return null;

  return (
    <Rnd
      default={{ x: 50, y: 50, width: 900, height: 600 }}
      minWidth={600}
      minHeight={400}
      bounds="window"
      className="rounded-lg shadow-lg bg-white"
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center cursor-move p-2.5 bg-gray-200 rounded-t-lg">
        <h2 className="font-bold">
          Workflow JSON - {workflowId}
          {currentNodeId ? ` / Node: ${currentNodeId}` : ""}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() =>
              workflowData && copy(JSON.stringify(workflowData, null, 2))
            }
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Copy JSON
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* JSON 뷰어 */}
      <div
        ref={containerRef}
        className="overflow-y-auto p-2.5 h-[calc(100%-48px)]"
      >
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {workflowData && (
          <JsonViewer
            value={workflowData}
            defaultInspectDepth={2} // 모든 키 동일하게 2레벨까지만 펼침
          />
        )}
      </div>
    </Rnd>
  );
};
