// tabbedWorkflowEditor.tsx
"use client";

import { useState } from "react";
import { WorkflowEditor } from "../workflow/workflowEditor";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { Input, Button, Table } from "antd";
import { ReactFlowProvider } from "reactflow";
interface Tab {
  id: string; // 탭 고유 ID
  workflowId: string; // 워크플로우 고유 ID
  workflowName: string; // 실제 워크플로우 이름
}

export function TabbedWorkflowEditor() {
  const { BrunnerMessageBox, openModal } = useModal();

  // 탭 상태
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab1",
      workflowId: "17dca48f-7fb2-4175-90a8-716e36efcd18",
      workflowName: "New Workflow",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab1");

  // 액티브 탭 찾기
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // 워크플로우 이름 변경 콜백
  const handleWorkflowChange = (workflowId: string, name: string) => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        workflowId, // 무조건 덮어쓰기
        workflowName: name,
      }))
    );
  };

  // 새 탭 생성
  const handleAddTab = (workflowId: string, workflowName: string) => {
    const newTabId = `tab${tabs.length + 1}`;
    setTabs([...tabs, { id: newTabId, workflowId, workflowName }]);
    setActiveTabId(newTabId);
  };

  // 탭 닫기
  const handleCloseTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      // 닫은 탭이 현재 액티브 탭이면, 새 액티브 탭 지정
      if (tabId === activeTabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1]!.id); // 마지막 탭으로 전환
      } else if (newTabs.length === 0) {
        setActiveTabId(""); // 탭이 하나도 없으면 빈 문자열
      }

      return newTabs;
    });
  };

  return (
    <>
      <BrunnerMessageBox />

      <div className="flex flex-col h-full">
        {/* 탭 바 */}
        <div className="flex border-b border-gray-300">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center border-r border-gray-200"
            >
              <Button
                className={`px-4 py-2 ${
                  tab.id === activeTabId
                    ? "border-b-2 general-text-bg-color border border-black"
                    : "semi-text-bg-color border border-black"
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.workflowName}
              </Button>
              <Button
                className="px-2 text-red-500 font-bold"
                onClick={() => handleCloseTab(tab.id)}
              >
                ×
              </Button>
            </div>
          ))}

          <Button
            className="ml-auto px-4 py-2 general-text-bg-color border border-black"
            onClick={() =>
              handleAddTab(`wf-${tabs.length + 1}`, "New Workflow")
            }
          >
            + Tab
          </Button>
        </div>

        {/* 액티브 탭 내용 */}
        <div className="flex flex-col h-full">
          {activeTab && (
            <ReactFlowProvider>
              <WorkflowEditor
                key={activeTab.id}
                workflowId={activeTab.workflowId}
                openModal={openModal}
                onWorkflowIDNameChange={handleWorkflowChange} // 이름 변경 콜백
              />
            </ReactFlowProvider>
          )}
        </div>
      </div>
    </>
  );
}
