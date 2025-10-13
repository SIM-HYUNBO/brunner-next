"use client";

import React, { useEffect, useState } from "react";
import RequestServer from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as userInfo from "@/components/core/client/frames/userInfo";

interface Workflow {
  id: string;
  workflow_data: any;
}

interface WorkflowSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (workflow: Workflow) => void;
}

const WorkflowSelectModal: React.FC<WorkflowSelectModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);

  useEffect(() => {
    if (open) {
      getWorkflowList();
    }
  }, [open]);

  const getWorkflowList = async () => {
    try {
      let jResponse = null;

      const jRequest = {
        commandName: constants.commands.WORKFLOW_SELECT_WORKFLOW_LIST, // ✅ 서버 명령어 (목록 조회)
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
      };

      // 서버에 목록 조회 요청
      jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0 && Array.isArray(jResponse.list.rows)) {
        setWorkflows(jResponse.list.rows); // ✅ 목록 배열 반환 (id, name, description 등)
      } else {
        openModal(jResponse.error_message);
        return [];
      }
    } catch (err) {
      openModal("❌ 워크플로우 목록 조회 실패: " + String(err));
      return [];
    }
  };

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center general-text-bg-color"
      onClick={onClose}
    >
      <div
        className="semi-text-bg-color rounded-lg shadow-lg w-[700px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭시 닫히지 않게
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-semibold">워크플로우 선택</h2>
          <button onClick={onClose} className="">
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center">불러오는 중...</div>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="medium-text-bg-color">
                  <th className="px-4 py-2 text-left border-b">ID</th>
                  <th className="px-4 py-2 text-left border-b">데이터</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    onClick={() => setSelected(wf)}
                    className={`cursor-pointer ${
                      selected?.id === wf.id
                        ? "theme-medium-text-bg-color"
                        : "semi-text-bg-color"
                    }`}
                  >
                    <td className="px-4 py-2 border-b">{wf.id}</td>
                    <td className="px-4 py-2 border-b font-medium">
                      {wf.workflow_data.workflowName}
                    </td>
                  </tr>
                ))}

                {workflows.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="text-center">
                      등록된 워크플로우가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md">
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selected}
            className={`px-4 py-2 text-sm rounded-md`}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSelectModal;
