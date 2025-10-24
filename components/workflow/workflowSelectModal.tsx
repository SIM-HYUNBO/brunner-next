"use client";

import React, { useEffect, useState, useRef } from "react";
import RequestServer from "@/components/core/client/requestServer";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as userInfo from "@/components/core/client/frames/userInfo";
import { Button } from "antd";

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
  const { openModal } = useModal();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);

  // ✅ 모달 이동 관련 상태
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    if (open) {
      getWorkflowList();
    }
  }, [open]);

  const getWorkflowList = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.WORKFLOW_SELECT_WORKFLOW_LIST,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
      };
      const jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0 && Array.isArray(jResponse.list.rows)) {
        setWorkflows(jResponse.list.rows);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (err) {
      openModal("❌ 워크플로우 목록 조회 실패: " + String(err));
    }
  };

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  // ✅ 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: position.x,
        offsetY: position.y,
      };
    }
  };

  // ✅ 드래그 중
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: dragStart.current.offsetX + dx,
      y: dragStart.current.offsetY + dy,
    });
  };

  // ✅ 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ✅ 전역 이벤트 등록
  useEffect(() => {
    if (isDragging) {
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
  }, [isDragging]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      // onClick={onClose}
    >
      <div
        ref={modalRef}
        className="semi-text-bg-color rounded-lg shadow-lg w-[700px] max-h-[80vh] flex flex-col absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 (드래그 영역) */}
        <div
          className="medium-text-bg-color flex items-center justify-between border-b px-2 py-1 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <h4 className="text-lg select-none">Select workflow</h4>
          <Button className="semi-text-bg-color" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* 본문 */}
        <div className="flex-1 mt-5 overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center">Loading ...</div>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr className="medium-text-bg-color">
                  <th className="px-4 py-2 text-left border-b">ID</th>
                  <th className="px-4 py-2 text-left border-b">Name</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    onClick={() => setSelected(wf)}
                    className={`cursor-pointer ${
                      selected?.id === wf.id
                        ? "medium-text-bg-color"
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
                      Loading ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <Button
            onClick={handleSelect}
            disabled={!selected}
            className="general-text-bg-color px-4 py-2 text-sm rounded-md"
          >
            Select
          </Button>{" "}
          <Button
            onClick={onClose}
            className="semi-text-bg-color px-4 py-2 text-sm rounded-md"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSelectModal;
