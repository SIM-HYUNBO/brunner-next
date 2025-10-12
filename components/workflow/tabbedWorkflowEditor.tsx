// tabbedWorkflowEditor.tsx
"use client";

import { useState } from "react";
import { WorkflowEditor } from "../workflow/workflowEditor";
import { useModal } from "@/components/core/client/brunnerMessageBox";

interface Tab {
  id: string;
  title: string;
  workflowId: string;
}

export default function TabbedWorkflowEditor() {
  const { BrunnerMessageBox, openModal } = useModal();

  // 탭 상태
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "tab1", title: "워크플로우 1", workflowId: "wf1" },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab1");

  // 액티브 탭의 WorkflowEditor 렌더링
  const tabbedWorkflowEditor = tabs.map(
    (tab) =>
      tab.id === activeTabId && (
        <WorkflowEditor
          key={tab.id}
          workflowId={tab.workflowId}
          openModal={openModal}
        />
      )
  );

  return (
    <>
      <BrunnerMessageBox />

      <div className="flex flex-col h-full">
        {/* 탭 바 */}
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 ${
                tab.id === activeTabId
                  ? "border-b-2 border-blue-500 font-bold"
                  : ""
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.title}
            </button>
          ))}
          <button
            className="ml-auto px-4 py-2 text-green-600"
            onClick={() => {
              const newTabId = `tab${tabs.length + 1}`;
              setTabs([
                ...tabs,
                {
                  id: newTabId,
                  title: `워크플로우 ${tabs.length + 1}`,
                  workflowId: "",
                },
              ]);
              setActiveTabId(newTabId);
            }}
          >
            + 새 탭
          </button>
        </div>

        {/* 액티브 탭 내용 */}
        <div className="flex flex-col h-full">{tabbedWorkflowEditor}</div>
      </div>
    </>
  );
}
