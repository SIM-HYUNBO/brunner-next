"use strict";

import * as constants from "@/components/core/constants";

// -------------------- 타입 정의 --------------------
export interface NodeDatasetField {
  table: string; // 테이블 이름
  value: Record<string, any>[]; // 행 배열
}

export interface NodeInputField {
  key: string;
  type: string;
  value?: NodeDatasetField[];
  sourceNodeId?: string;
}

export interface NodeOutputField {
  key: string;
  type: string;
  value?: NodeDatasetField[];
  sourceNodeId?: string;
}

export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  inputs: NodeInputField[];
  outputs: NodeOutputField[];
}

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: NodeDatasetField[];
  output?: NodeDatasetField[];
};

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  nodeId: string,
  actionData: NodeDatasetField[],
  workflowData: WorkflowContext
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, NodeDatasetField[]>();

// -------------------- 기본 입력/출력 --------------------
export function getDefaultInputs(actionName: string): NodeInputField[] {
  switch (actionName) {
    case constants.workflowActions.START:
      return [];
    case constants.workflowActions.SLEEP:
      return [
        { key: "ms", type: "direct", value: [{ table: "sleep", value: [] }] },
      ];
    case constants.workflowActions.HTTPREQUEST:
      return [
        { key: "url", type: "direct", value: [{ table: "http", value: [] }] },
        {
          key: "method",
          type: "direct",
          value: [{ table: "http", value: [] }],
        },
      ];
    case constants.workflowActions.SET:
      return [{ key: "dataset", type: "dataset", value: [] }];
    case constants.workflowActions.MERGE:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
      return [{ key: "dataset", type: "dataset", value: [] }];
    case constants.workflowActions.END:
      return [];
    default:
      return [];
  }
}

export function getDefaultOutputs(actionName: string): NodeOutputField[] {
  return [{ key: "dataset", type: "dataset", value: [] }];
}

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  const logAction = (
    nodeId: string,
    inputs: NodeDatasetField[],
    workflowData: WorkflowContext
  ) => {
    console.log(
      `Execute Node [${nodeId}] Inputs: ${JSON.stringify(inputs, null, 2)}`
    );
  };

  // ---------------- START ----------------
  registerAction(
    constants.workflowActions.START,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      workflowData.output = stepInputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, []);

  // ---------------- END ----------------
  registerAction(
    constants.workflowActions.END,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      workflowData.output = stepInputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, []);

  // ---------------- SET ----------------
  registerAction(
    constants.workflowActions.SET,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      stepInputs.forEach((f) => {
        workflowData[f.table] = f.value;
      });
      workflowData.output = stepInputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SET, []);

  // ---------------- HTTPREQUEST ----------------
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      const url =
        stepInputs.find((f) => f.table === "http")?.value[0]?.url || "";
      const method =
        stepInputs.find((f) => f.table === "http")?.value[0]?.method || "GET";
      const res = await fetch(url, { method });
      const data = await res.json();
      workflowData.output = [
        { table: "http_response", value: Array.isArray(data) ? data : [data] },
      ];
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.HTTPREQUEST, []);

  // ---------------- SLEEP ----------------
  registerAction(
    constants.workflowActions.SLEEP,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      const ms =
        stepInputs.find((f) => f.table === "sleep")?.value[0]?.ms || 300;
      await new Promise((resolve) => setTimeout(resolve, ms));
      workflowData.output = stepInputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, []);

  // ---------------- MERGE ----------------
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      const base = stepInputs.find((f) => f.table === "base")?.value[0] || {};
      const extra = stepInputs.find((f) => f.table === "extra")?.value[0] || {};
      const merged = { ...base, ...extra };
      workflowData.output = [{ table: "merged", value: [merged] }];
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MERGE, []);

  // ---------------- BRANCH ----------------
  registerAction(
    constants.workflowActions.BRANCH,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      const condition = stepInputs.find((f) => f.table === "branch")?.value[0]
        ?.condition;
      const trueNode = stepInputs.find((f) => f.table === "branch")?.value[0]
        ?.trueNodeId;
      const falseNode = stepInputs.find((f) => f.table === "branch")?.value[0]
        ?.falseNodeId;
      workflowData.output = [
        {
          table: "branch_result",
          value: [{ nextNodeId: condition ? trueNode : falseNode }],
        },
      ];
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.BRANCH, []);

  // ---------------- MATHOP ----------------
  registerAction(
    constants.workflowActions.MATHOP,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      const left =
        stepInputs.find((f) => f.table === "math")?.value[0]?.left || 0;
      const right =
        stepInputs.find((f) => f.table === "math")?.value[0]?.right || 0;
      const op =
        stepInputs.find((f) => f.table === "math")?.value[0]?.op || "add";
      let result = 0;
      switch (op) {
        case "add":
          result = left + right;
          break;
        case "sub":
          result = left - right;
          break;
        case "mul":
          result = left * right;
          break;
        case "div":
          result = right !== 0 ? left / right : 0;
          break;
      }
      workflowData.output = [{ table: "math_result", value: [{ result }] }];
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MATHOP, []);

  // ---------------- CALL ----------------
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId, stepInputs, workflowData) => {
      logAction(nodeId, stepInputs, workflowData);
      // TODO: 다른 워크플로우 호출 로직 구현
      workflowData.output = stepInputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.CALL, []);
}

// -------------------- 공용 액션 함수 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}

export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}

export function getDefaultParams(actionName: string): NodeDatasetField[] {
  return defaultParamsMap.get(actionName) || [];
}
