"use client";

import React, { useState } from "react";
import WorkflowSelectModal from "@/components/workflow/workflowSelectModal";

interface WorkflowSelectorProps {
  onSelect?: (workflow: any) => void; // prop 정의
}

export default function WorkflowSelector({ onSelect }: WorkflowSelectorProps) {
  // 모달 열림 여부
  const [modalOpen, setModalOpen] = useState(false);

  // 선택된 워크플로우 정보
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  // 선택 완료 시 콜백
  const handleSelectWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow); // 내부 상태 갱신
    if (onSelect) onSelect(workflow); // prop으로 전달된 함수 호출
    setModalOpen(false); // 모달 닫기
  };

  return (
    <div className="p-6">
      {/* 모달 열기 버튼 */}
      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        워크플로우 선택
      </button>

      {/* 선택된 워크플로우 표시 */}
      {selectedWorkflow && (
        <div className="mt-3 text-gray-700">
          선택된 워크플로우:{" "}
          <b>
            {selectedWorkflow.name} ({selectedWorkflow.id})
          </b>
          <div className="text-sm text-gray-500">
            {selectedWorkflow.description}
          </div>
        </div>
      )}

      {/* 워크플로우 선택 모달 */}
      <WorkflowSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectWorkflow}
      />
    </div>
  );
}
