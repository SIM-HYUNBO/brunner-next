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

  const [tabs, setTabs] = useState<(Tab & { isDirty?: boolean })[]>([
    {
      id: "tab1",
      workflowId: "17dca48f-7fb2-4175-90a8-716e36efcd18",
      workflowName: "New Workflow",
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab1");

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // 워크플로우 수정 시 isDirty=true
  const handleWorkflowChange = (workflowId: string, name: string) => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        workflowId,
        workflowName: name,
        isDirty: true, // 수정됨 표시
      }))
    );
  };

  // 새 탭 생성
  const handleAddTab = (workflowId: string, workflowName: string) => {
    const newTabId = `tab${tabs.length + 1}`;
    setTabs([
      ...tabs,
      { id: newTabId, workflowId, workflowName, isDirty: false },
    ]);
    setActiveTabId(newTabId);
  };

  // 탭 닫기 전 확인
  const handleCloseTab = useCallback(
    async (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.isDirty) {
        const confirmClose = await openModal(
          `"${tab.workflowName} ${constants.messages.WORKFLOW_SAVE_CONFIRM}`
        );
        if (!confirmClose) return;
      }

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

  // 브라우저 닫기/새로고침 확인
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dirtyTab = tabs.find((t) => t.isDirty);
      if (!dirtyTab) return;

      e.preventDefault();
      e.returnValue = ""; // Chrome/Edge는 기본 경고만 보여줌
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tabs]);

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
