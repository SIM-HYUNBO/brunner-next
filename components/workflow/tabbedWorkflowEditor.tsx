"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  NodeProps,
} from "reactflow";
import * as constants from "@/components/core/constants";
import { useModal } from "@/components/core/client/brunnerMessageBox";
import { WorkflowEditor } from "./workflowEditor";
import { ReactFlowProvider } from "reactflow";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as commonData_WF from "@/components/core/client/commonData_WF";
import { v4 as uuidv4 } from "uuid";
import { Button } from "antd";

interface Tab {
  id: string; // 탭 고유 ID
  workflow: {
    workflowId: string;
    workflowName: string;
    nodes: Node<commonData_WF.ActionNodeData>[];
    edges: Edge<commonData_WF.ConditionEdgeData>[];
  };
  x: number;
  y: number;
  zoom: number;
}

export function TabbedWorkflowEditor() {
  const { BrunnerMessageBox, openModal } = useModal();

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab1",
      workflow: {
        workflowId: uuidv4(),
        workflowName: "New Workflow",
        // editorState: {
        nodes: [
          {
            id: uuidv4(),
            type: "default",
            position: { x: 100, y: 100 },
            data: {
              label: constants.workflowActions.START,
              actionName: constants.workflowActions.START,
              status: constants.workflowRunStatus.idle,
              design: {
                inputs: commonFunctions.getDefaultInputs(
                  constants.workflowActions.START
                ),
                outputs: commonFunctions.getDefaultOutputs(
                  constants.workflowActions.START
                ),
                scriptContents: constants.General.EmptyString,
                scriptTimeoutMs: 5000,
              },
              run: { inputs: [], outputs: [] },
            },
          },
          {
            id: uuidv4(),
            type: "default",
            position: { x: 100, y: 500 },
            data: {
              label: constants.workflowActions.END,
              actionName: constants.workflowActions.END,
              status: constants.workflowRunStatus.idle,
              design: {
                inputs: commonFunctions.getDefaultInputs(
                  constants.workflowActions.END
                ),
                outputs: commonFunctions.getDefaultOutputs(
                  constants.workflowActions.END
                ),
                scriptContents: constants.General.EmptyString,
                scriptTimeoutMs: 5000,
              },
              run: { inputs: [], outputs: [] },
            },
          },
        ],
        edges: [],
      },
      x: 0,
      y: 0,
      zoom: 1.0,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>("tab1");

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // 새 탭 추가
  const handleAddTab = () => {
    const newTabId = `tab${tabs.length + 1}`;
    const newWorkflow = {
      workflowId: uuidv4(),
      workflowName: "New Workflow",
      // editorState: {
      nodes: [
        {
          id: uuidv4(),
          type: "default",
          position: { x: 100, y: 100 },
          data: {
            label: constants.workflowActions.START,
            actionName: constants.workflowActions.START,
            status: constants.workflowRunStatus.idle,
            design: {
              inputs: commonFunctions.getDefaultInputs(
                constants.workflowActions.START
              ),
              outputs: commonFunctions.getDefaultOutputs(
                constants.workflowActions.START
              ),
              scriptContents: constants.General.EmptyString,
              scriptTimeoutMs: 5000,
            },
            run: { inputs: [], outputs: [] },
          },
        },
        {
          id: uuidv4(),
          type: "default",
          position: { x: 100, y: 500 },
          data: {
            label: constants.workflowActions.END,
            actionName: constants.workflowActions.END,
            status: constants.workflowRunStatus.idle,
            design: {
              inputs: commonFunctions.getDefaultInputs(
                constants.workflowActions.END
              ),
              outputs: commonFunctions.getDefaultOutputs(
                constants.workflowActions.END
              ),
              scriptContents: constants.General.EmptyString,
              scriptTimeoutMs: 5000,
            },
            run: { inputs: [], outputs: [] },
          },
        },
      ],
      edges: [],
    };
    const newZoom = 1.0;
    const newX = 0;
    const newY = 0;
    setTabs((prevTabs) => [
      ...prevTabs,
      { id: newTabId, workflow: newWorkflow, x: newX, y: newY, zoom: newZoom },
    ]);
    setActiveTabId(newTabId);
  };

  // 탭 닫기
  const handleCloseTab = useCallback(
    async (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;

      const confirmClose = await openModal(
        `"${tab.workflow.workflowName}" ${constants.messages.WORKFLOW_SAVE_CONFIRM}`
      );
      if (!confirmClose) return;

      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((t) => t.id !== tabId);

        if (tabId === activeTabId && newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1]!.id);
        } else if (newTabs.length === 0) {
          setActiveTabId(constants.General.EmptyString);
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
                {tab.workflow.workflowName}
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
            onClick={handleAddTab}
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
                workflow={activeTab.workflow}
                x={activeTab.x}
                y={activeTab.y}
                zoom={activeTab.zoom}
                openModal={openModal}
                onWorkflowChange={(newWorkflow: any) => {
                  setTabs((prevTabs) =>
                    prevTabs.map((tab) =>
                      tab.id === activeTab.id
                        ? {
                            ...tab,
                            workflow: newWorkflow,
                          }
                        : tab
                    )
                  );
                }}
              />
            </ReactFlowProvider>
          )}
        </div>
      </div>
    </>
  );
}
