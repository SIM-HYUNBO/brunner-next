"use strict";

import * as constants from "@/components/core/constants";
import { JsonDatasetManager } from "@/components/workflow/jsonDatasetManager";

// 컬럼 단위 정의
export interface DatasetColumn {
  key: string; // 항상 있어야 함
  type: "string" | "number" | "boolean" | "object"; // 항상 있어야 함
  value?: any;
  bindingType?: "direct" | "ref";
  sourceNodeId?: string; // 바인딩 되어 있을때
}

export interface DatasetColumnWithUI extends DatasetColumn {
  bindingType: "direct" | "ref";
  sourceNodeId?: string;
}

export interface NodeDataTableWithUI {
  table: string;
  value: Record<string, any>[]; // 실제 데이터
  columns: DatasetColumnWithUI[]; // 컬럼 정보
}

// -------------------- 타입 정의 --------------------
export interface NodeDataTable {
  table: string;
  columns: DatasetColumn[];
  value: Record<string, any>[];
}

export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  inputs: NodeDataTable[];
  outputs: NodeDataTable[];
}

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: NodeDataTable[];
  output?: NodeDataTable[];
};

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  nodeId: string,
  stepInputs: NodeDataTable[],
  workflowData: WorkflowContext,
  datasetManager?: JsonDatasetManager
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, NodeDataTable[]>();

// -------------------- 기본 입력/출력 --------------------
export function getDefaultInputs(actionName: string): NodeDataTable[] {
  switch (actionName) {
    case constants.workflowActions.START:
    case constants.workflowActions.SLEEP:
    case constants.workflowActions.HTTPREQUEST:
    case constants.workflowActions.SET:
    case constants.workflowActions.MERGE:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
    default:
      return [{ table: "INDATA", columns: [], value: [] }];
  }
}

export function getDefaultOutputs(actionName: string): NodeDataTable[] {
  switch (actionName) {
    case constants.workflowActions.START:
    case constants.workflowActions.SLEEP:
    case constants.workflowActions.HTTPREQUEST:
    case constants.workflowActions.SET:
    case constants.workflowActions.MERGE:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
    default:
      return [{ table: "OUTDATA", columns: [], value: [] }];
  }
}

// -------------------- 액션 등록 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}

export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}

export function getDefaultParams(actionName: string): NodeDataTable[] {
  return defaultParamsMap.get(actionName) || [];
}

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  const logAction = (
    nodeId: string,
    inputs: NodeDataTable[],
    workflowData: WorkflowContext
  ) => {
    console.log(
      `Execute Node [${nodeId}] Inputs:`,
      JSON.stringify(inputs, null, 2)
    );
  };

  // START
  registerAction(
    constants.workflowActions.START,
    async (nodeId, inputs, workflowData) => {
      logAction(nodeId, inputs, workflowData);
      workflowData.output = inputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, []);

  // END
  registerAction(
    constants.workflowActions.END,
    async (nodeId, inputs, workflowData) => {
      logAction(nodeId, inputs, workflowData);
      workflowData.output = inputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, []);

  // SET
  registerAction(
    constants.workflowActions.SET,
    async (nodeId, inputs, workflowData, datasetManager) => {
      logAction(nodeId, inputs, workflowData);
      inputs.forEach((f) => {
        if (datasetManager)
          datasetManager.setField(nodeId + "_outputs", f.table, f.value);
        workflowData[f.table] = f.value;
      });
      workflowData.output = inputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SET, []);

  // HTTPREQUEST
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId, inputs, workflowData, datasetManager) => {
      logAction(nodeId, inputs, workflowData);
      const url = inputs.find((f) => f.table === "http")?.value[0]?.url || "";
      const method =
        inputs.find((f) => f.table === "http")?.value[0]?.method || "GET";
      const res = await fetch(url, { method });
      const data = await res.json();
      const output: NodeDataTable[] = [
        {
          table: "http_response",
          value: Array.isArray(data) ? data : [data],
          columns: [],
        },
      ];
      if (datasetManager && output && output[0])
        datasetManager.setField(
          nodeId + "_outputs",
          "http_response",
          output[0].value
        );
      workflowData.output = output;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.HTTPREQUEST, []);

  // SLEEP
  registerAction(
    constants.workflowActions.SLEEP,
    async (nodeId, inputs, workflowData) => {
      logAction(nodeId, inputs, workflowData);
      const ms = inputs.find((f) => f.table === "sleep")?.value[0]?.ms || 300;
      await new Promise((resolve) => setTimeout(resolve, ms));
      workflowData.output = inputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, []);

  // MERGE
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId, inputs, workflowData, datasetManager) => {
      logAction(nodeId, inputs, workflowData);
      const base = inputs.find((f) => f.table === "base")?.value[0] || {};
      const extra = inputs.find((f) => f.table === "extra")?.value[0] || {};
      const merged = { ...base, ...extra };
      const output: NodeDataTable[] = [
        { table: "merged", value: [merged], columns: [] },
      ];
      if (datasetManager)
        datasetManager.setField(nodeId + "_outputs", "merged", [merged]);
      workflowData.output = output;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MERGE, []);

  // BRANCH
  registerAction(
    constants.workflowActions.BRANCH,
    async (nodeId, inputs, workflowData) => {
      logAction(nodeId, inputs, workflowData);
      const condition = inputs.find((f) => f.table === "branch")?.value[0]
        ?.condition;
      const trueNode = inputs.find((f) => f.table === "branch")?.value[0]
        ?.trueNodeId;
      const falseNode = inputs.find((f) => f.table === "branch")?.value[0]
        ?.falseNodeId;
      workflowData.output = [
        {
          table: "branch_result",
          value: [{ nextNodeId: condition ? trueNode : falseNode }],
          columns: [],
        },
      ];
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.BRANCH, []);

  // MATHOP
  registerAction(
    constants.workflowActions.MATHOP,
    async (nodeId, inputs, workflowData, datasetManager) => {
      logAction(nodeId, inputs, workflowData);
      const left = inputs.find((f) => f.table === "math")?.value[0]?.left || 0;
      const right =
        inputs.find((f) => f.table === "math")?.value[0]?.right || 0;
      const op = inputs.find((f) => f.table === "math")?.value[0]?.op || "add";
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
      const output: NodeDataTable[] = [
        { table: "math_result", value: [{ result }], columns: [] },
      ];
      if (datasetManager)
        datasetManager.setField(nodeId + "_outputs", "math_result", [
          { result },
        ]);
      workflowData.output = output;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MATHOP, []);

  // CALL
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId, inputs, workflowData) => {
      logAction(nodeId, inputs, workflowData);
      // TODO: 다른 워크플로우 호출 로직
      workflowData.output = inputs;
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.CALL, []);
}
