"use strict";

import * as constants from "@/components/core/constants";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as workflowEngine from "@/components/workflow/workflowEngine";
// 컬럼 단위 정의
export interface DatasetColumn {
  key: string; // 항상 있어야 함
  type: "string" | "number" | "boolean" | "object"; // 항상 있어야 함
  value?: any;
  bindingType?: "direct" | "ref";
  sourceNodeId?: string; // 바인딩 되어 있을때
}

export interface DatasetColumnWithBinding extends DatasetColumn {
  bindingType: "direct" | "ref";
  sourceNodeId?: string;
}

export interface NodeDataTableWithBinding {
  table: string;
  value: Record<string, any>[]; // 실제 데이터
  columns: DatasetColumnWithBinding[]; // 컬럼 정보
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
  design: {
    inputs: NodeDataTable[];
    outputs: NodeDataTable[];
  };
  run: {
    inputs: NodeDataTable[];
    outputs: NodeDataTable[];
  };
}

export interface ConditionEdgeData {
  condition?: string;
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
  nodeData: NodeDataTable[],
  stepInputs: NodeDataTable[],
  workflow: any
) => Promise<void>;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, NodeDataTable[]>();

// -------------------- 기본 입력/출력 --------------------
export function getDefaultInputs(actionName: string): NodeDataTable[] {
  switch (actionName) {
    case constants.workflowActions.START:
      return [{ table: "OUTDATA", columns: [], value: [] }];
    case constants.workflowActions.SLEEP:
    case constants.workflowActions.HTTPREQUEST:
    case constants.workflowActions.SET:
    case constants.workflowActions.MERGE:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
      return [{ table: "OUTDATA", columns: [], value: [] }];
    default:
      throw new Error(constants.messages.WORKFLOW_NOT_SUPPORTED_NODE_TYPE);
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
    nodeData: NodeDataTable[],
    stepInputs: WorkflowContext
  ) => {
    console.log(
      `Execute Node [${nodeId}] Inputs:`,
      JSON.stringify(nodeData, null, 2)
    );
  };

  // START
  registerAction(
    constants.workflowActions.START,
    async (nodeId, nodeData, stepInputs, workflow) => {
      const nodesList: Node<any>[] = workflow.nodes;
      const node = nodesList.find((n) => n.id === nodeId);
      if (!node) return;
      logAction(nodeId, nodeData, stepInputs);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, []);

  // END
  registerAction(
    constants.workflowActions.END,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, []);

  // SET
  registerAction(
    constants.workflowActions.SET,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SET, []);

  // HTTPREQUEST
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.HTTPREQUEST, []);

  // SLEEP
  registerAction(
    constants.workflowActions.SLEEP,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, []);

  // MERGE
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MERGE, []);

  // BRANCH
  registerAction(
    constants.workflowActions.BRANCH,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.BRANCH, []);

  // MATHOP
  registerAction(
    constants.workflowActions.MATHOP,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MATHOP, []);

  // CALL
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId, nodeData, stepInputs, workflow) => {
      logAction(nodeId, nodeData, stepInputs);
      // nodeData["design"].outputs = nodeData.design.inputs;
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.CALL, []);
}
