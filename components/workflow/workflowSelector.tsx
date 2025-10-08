"use client";

import React, { useState, useEffect } from "react";
import WorkflowSelectModal from "@/components/workflow/workflowSelectModal";

interface WorkflowSelectorProps {
  onSelect?: (workflow: any) => void; // prop 정의
  selectedWorkflow?: any;
}

export default function WorkflowSelector({
  onSelect,
  selectedWorkflow,
}: WorkflowSelectorProps) {
  useEffect(() => {
    setLocalSelectedWorkflow(selectedWorkflow);
  }, [selectedWorkflow]);

  // 모달 열림 여부
  const [workflowSelectModalOpen, setWorkflowSelectModalOpen] = useState(false);

  // 선택된 워크플로우 정보
  const [localSelectedWorkflow, setLocalSelectedWorkflow] = useState<any>(null);

  // 선택 완료 시 콜백
  const handleSelectWorkflow = (workflow: any) => {
    // 선택한 Workflow의 정보를 서버에서 조회

    // 조회한 데이터로 갱신
    setLocalSelectedWorkflow(workflow); // 내부 상태 갱신
    if (onSelect) onSelect(workflow); // prop으로 전달된 함수 호출
    setWorkflowSelectModalOpen(false); // 모달 닫기
  };

  return (
    <div className="px-2">
      {/* 모달 열기 버튼 */}
      <button
        onClick={() => setWorkflowSelectModalOpen(true)}
        className="p-2 rounded-md semi-text-bg-color"
      >
        Select ...
      </button>

      {/* 선택된 워크플로우 표시 */}
      {localSelectedWorkflow && (
        <div className="mt-3 text-gray-700">
          <b>{localSelectedWorkflow.workflowId}</b>
          <br />
          <b>{localSelectedWorkflow?.workflowName}</b>
          <br />
          <b>{localSelectedWorkflow?.workflowDescription}</b>
        </div>
      )}

      {/* 워크플로우 선택 모달 */}
      <WorkflowSelectModal
        open={workflowSelectModalOpen}
        onClose={() => setWorkflowSelectModalOpen(false)}
        onSelect={handleSelectWorkflow}
      />
    </div>
  );
}
