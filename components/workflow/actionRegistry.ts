"use strict";

import * as constants from "@/components/core/constants";

// -------------------- 타입 정의 --------------------
export interface NodeInputField {
  key: string;
  type: string;
  value?: any;
  sourceNodeId?: string;
}

export interface NodeOutputField {
  key: string;
  type: string;
  value?: any;
  sourceNodeId?: string;
}

// 기존 ActionNodeData 유지
export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  inputs: NodeInputField[];
  outputs: NodeOutputField[];
}

// WorkflowContext
export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: any;
  __ACTION_RETURNS?: Map<string, any>;
};

// -------------------- Dataset 기반 필드 --------------------
export interface NodeDatasetField {
  table: string; // 테이블 이름
  value: Record<string, any>[]; // 행 배열
}

// SetStepParamItem 그대로 유지
interface SetStepParamItem {
  path: string;
  value: any;
}

type SetStepParams = SetStepParamItem | SetStepParamItem[];

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  nodeId: string,
  actionData: any,
  workflowData: WorkflowContext
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, Record<string, any>>();

// -------------------- 기본 입력값 반환 --------------------
export function getDefaultInputs(actionName: string): NodeInputField[] {
  switch (actionName) {
    case constants.workflowActions.START:
      return [];
    case constants.workflowActions.SLEEP:
      return [{ key: "ms", type: "direct", value: 1000 }];
    case constants.workflowActions.HTTPREQUEST:
      return [
        { key: "url", type: "direct", value: "https://api.example.com" },
        { key: "method", type: "direct", value: "GET" },
      ];
    case constants.workflowActions.SET:
      return [
        { key: "dataset", type: "dataset", value: [] as NodeDatasetField[] },
      ];
    default:
      return [];
  }
}

export function getDefaultOutputs(actionName: string): NodeOutputField[] {
  switch (actionName) {
    case constants.workflowActions.START:
    case constants.workflowActions.SLEEP:
    case constants.workflowActions.HTTPREQUEST:
    case constants.workflowActions.SET:
    default:
      return [];
  }
}

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  // step 실행 기록 유틸
  const actionLogging = (
    nodeId: string,
    stepInputs: any,
    workflowData: any
  ) => {
    console.log(
      `Execute Workflow Node [${nodeId}] Action [inputs:${JSON.stringify(
        stepInputs,
        null,
        2
      )}]`
    );
  };

  // ---------------- START ----------------
  registerAction(
    constants.workflowActions.START,
    async (nodeId: string, stepInputs: any, workflowData: WorkflowContext) => {
      actionLogging(nodeId, stepInputs, workflowData);
      return stepInputs;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, {});

  // ---------------- END ----------------
  registerAction(
    constants.workflowActions.END,
    async (nodeId: string, stepInputs: any, workflowData: WorkflowContext) => {
      actionLogging(nodeId, stepInputs, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, {});

  // ---------------- SET ----------------
  registerAction(
    constants.workflowActions.SET,
    async (
      nodeId: string,
      stepInputs: NodeDatasetField[],
      workflowData: WorkflowContext
    ) => {
      // NodeDatasetField[] → SetStepParamItem[] 변환
      const actions: SetStepParamItem[] = stepInputs.map((f) => ({
        path: f.table,
        value: f.value,
      }));

      // workflowData에 path 기준으로 값 저장
      for (const { path, value } of actions) {
        const keys = path.split(".");
        let target: Record<string, any> = workflowData;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!key) continue;

          if (typeof target[key] !== "object" || target[key] === null) {
            target[key] = {};
          }
          target = target[key];
        }

        const lastKey = keys[keys.length - 1];
        if (lastKey) {
          target[lastKey] = value;
        }
      }

      workflowData.__ACTION_RETURNS =
        workflowData.__ACTION_RETURNS || new Map();
      workflowData.__ACTION_RETURNS.set(nodeId, actions);

      actionLogging(nodeId, stepInputs, workflowData);

      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SET, []);

  // 나머지 노드는 기존 로직 그대로...
}

// -------------------- 공용 액션 함수 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}
export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}
export function getDefaultParams(actionName: string): Record<string, any> {
  return defaultParamsMap.get(actionName) || {};
}
