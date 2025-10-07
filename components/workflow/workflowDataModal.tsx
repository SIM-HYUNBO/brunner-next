// components/workflow/WorkflowDataModal.tsx
import React, { useEffect, useRef, useState } from "react";
import ReactJson from "react18-json-view";
import { Rnd } from "react-rnd";
import * as constants from "@/components/core/constants";
import RequestServer from "@/components/core/client/requestServer";

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

  // 서버에서 워크플로우 데이터 가져오기
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
    if (open && workflowId) {
      fetchWorkflowData(workflowId);
    } else {
      setWorkflowData(null);
      setError(null);
    }
  }, [open, workflowId]);

  // 자동 스크롤 + 하이라이트
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
        // 상위 li에서 data 노드 찾기
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
      } else {
        // 아직 렌더링 안 됐으면 50ms 후 재시도
        setTimeout(scrollToNode, 50);
      }
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
      style={{
        background: "white",
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          cursor: "move",
          padding: "8px",
          backgroundColor: "#f3f3f3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>
          Workflow JSON - {workflowId}
          {currentNodeId ? ` / Node: ${currentNodeId}` : ""}
        </h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
            padding: "4px 12px",
            borderRadius: 4,
          }}
        >
          Close
        </button>
      </div>

      {/* 내용 */}
      <div
        ref={containerRef}
        style={{
          height: "calc(100% - 48px)",
          overflowY: "auto",
          padding: 8,
        }}
      >
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {workflowData && (
          <ReactJson
            src={workflowData}
            enableClipboard
            collapsed={false} // 전체 펼치기
          />
        )}
      </div>
    </Rnd>
  );
};
