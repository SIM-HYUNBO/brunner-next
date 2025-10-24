import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import * as constants from "@/components/core/constants";
import { WorkflowEditor } from "./workflowEditor";
import { ReactFlowProvider, ReactFlow } from "reactflow";
import { Input, Button, Table } from "antd";

interface Tab {
  id: string; // 탭 고유 ID
  workflowId: string; // 워크플로우 고유 ID
  workflowName: string; // 실제 워크플로우 이름
}

export function TabbedWorkflowEditor() {
  const { BrunnerMessageBox, openModal } = useModal();

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab1",
      workflowId: "17dca48f-7fb2-4175-90a8-716e36efcd18",
      workflowName: "New Workflow",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab1");

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    if (!activeTab) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? { ...tab } // 새로 연 워크플로우는 깨끗하게
          : tab
      )
    );
  }, [activeTab?.id]);

  // 새 탭 생성
  const handleAddTab = (workflowId: string, workflowName: string) => {
    const newTabId = `tab${tabs.length + 1}`;
    setTabs([...tabs, { id: newTabId, workflowId, workflowName }]);
    setActiveTabId(newTabId);
  };

  // 탭 닫기 전 확인
  const handleCloseTab = useCallback(
    async (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      const confirmClose = await openModal(
        `"${tab?.workflowName} ${constants.messages.WORKFLOW_SAVE_CONFIRM}`
      );
      if (!confirmClose) return;

      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((t) => t.id !== tabId);

        if (tabId === activeTabId && newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1]!.id);
        } else if (newTabs.length === 0) {
          setActiveTabId("");
        }

        return newTabs;
      });
    },
    [tabs, activeTabId]
  );

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
                className="px-2 semi-text-bg-color"
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
              />
            </ReactFlowProvider>
          )}
        </div>
      </div>
    </>
  );
}
