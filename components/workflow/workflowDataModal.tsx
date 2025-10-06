// components/workflow/WorkflowDataModal.tsx
import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { Rnd } from "react-rnd";
import * as constants from "@/components/core/constants";
import RequestServer from "@/components/core/client/requestServer";

interface WorkflowDataModalProps {
  workflowId: string;
  open: boolean;
  onClose: () => void;
}

export const WorkflowDataModal: React.FC<WorkflowDataModalProps> = ({
  workflowId,
  open,
  onClose,
}) => {
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      {/* 헤더: 드래그 가능 */}
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
        <h2 style={{ fontWeight: "bold" }}>Workflow JSON - {workflowId}</h2>
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

      {/* 내용: 남은 영역 스크롤 */}
      <div
        style={{
          height: "calc(100% - 48px)", // 헤더 높이만큼 뺌
          overflowY: "auto",
          padding: 8,
        }}
      >
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {workflowData && (
          <ReactJson
            src={workflowData}
            name={false}
            enableClipboard
            displayDataTypes={false}
            displayObjectSize
            collapsed={false}
          />
        )}
      </div>
    </Rnd>
  );
};
