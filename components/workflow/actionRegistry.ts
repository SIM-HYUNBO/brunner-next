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
export type ActionHandler = (node: Node<any>, workflow: any) => Promise<void>;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, NodeDataTable[]>();

// -------------------- 기본 입력/출력 --------------------
export function getDefaultInputs(actionName: string): NodeDataTable[] {
  switch (actionName) {
    case constants.workflowActions.START:
      return [{ table: "INDATA", columns: [], value: [] }];
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

// 객체 경로로 값 가져오기
function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

/** value (객체)의 모든 템플릿 {{}} 데이터를 실제 값으로 치환 */
export function interpolate(value: any, ctx: any): any {
  if (typeof value === "string") {
    return value.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const v = getByPath(ctx, key.trim());
      return v == null ? "" : String(v);
    });
  }

  if (Array.isArray(value)) return value.map((v: any) => interpolate(v, ctx));

  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    Object.keys(value).forEach((k) => {
      out[k] = interpolate(value[k], ctx);
    });
    return out;
  }

  return value;
}

// 조건 평가
export function evalCondition(cond: any, workflowData: any) {
  if (!cond) return true;
  const res = interpolate(cond, workflowData).trim().toLowerCase();
  return res !== "" && res !== "false" && res !== "0";
}

const nodeActionLogging = (node: Node<any>, stepInputs: WorkflowContext) => {
  console.log(
    `Execute Node [${node.id}] Inputs:`,
    JSON.stringify(node.data, null, 2)
  );
};

const preNodeCheck = (node: Node<any>, workflowData: any) => {
  // 조건(if) 확인
  workflowData.currentNodeId = node.id;
  node.data.status = constants.workflowRunStatus.running;

  if (!evalCondition(node.data.if, workflowData)) {
    return false; // 조건 불일치 → 실행하지 않음
  }
  // 파라미터 보간 처리
  node.data.run.inputs = interpolate(
    node.data.design.inputs || {},
    workflowData
  );
  nodeActionLogging(node, node.data.run.inputs);
  return true;
};

const postNodeCheck = (node: Node<any>, workflowData: any) => {
  node.data.status = constants.workflowRunStatus.idle;

  if (node.data.actionName === constants.workflowActions.END)
    workflowData.currentNodeId = null;
};

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  // START
  registerAction(
    constants.workflowActions.START,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      postNodeCheck(node, workflowData);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, []);

  // END
  registerAction(constants.workflowActions.END, async (node, workflowData) => {
    if (!node) return;
    if (!preNodeCheck(node, workflowData)) {
      postNodeCheck(node, workflowData);
      return;
    }

    postNodeCheck(node, workflowData);
    return;
  });
  defaultParamsMap.set(constants.workflowActions.END, []);

  // SET
  registerAction(constants.workflowActions.SET, async (node, workflowData) => {
    if (!node) return;
    if (!preNodeCheck(node, workflowData)) {
      postNodeCheck(node, workflowData);
      return;
    }

    postNodeCheck(node, workflowData);
    return;
  });
  defaultParamsMap.set(constants.workflowActions.SET, []);

  // HTTPREQUEST
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      postNodeCheck(node, workflowData);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.HTTPREQUEST, []);

  // SLEEP
  registerAction(
    constants.workflowActions.SLEEP,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          // console.log(`✅ ${ms}ms 대기 완료`);
          resolve();
          postNodeCheck(node, workflowData);
          return;
        }, 3000);
      });
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, []);

  // MERGE
  registerAction(
    constants.workflowActions.MERGE,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      postNodeCheck(node, workflowData);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MERGE, []);

  // BRANCH
  registerAction(
    constants.workflowActions.BRANCH,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      postNodeCheck(node, workflowData);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.BRANCH, []);

  // MATHOP
  registerAction(
    constants.workflowActions.MATHOP,
    async (node, workflowData) => {
      if (!node) return;
      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        return;
      }

      postNodeCheck(node, workflowData);
      return;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MATHOP, []);

  // CALL
  registerAction(constants.workflowActions.CALL, async (node, workflowData) => {
    if (!node) return;
    if (!preNodeCheck(node, workflowData)) {
      postNodeCheck(node, workflowData);
      return;
    }

    postNodeCheck(node, workflowData);
    return;
  });
  defaultParamsMap.set(constants.workflowActions.CALL, []);
}
