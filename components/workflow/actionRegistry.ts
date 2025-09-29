"use strict";

import * as constants from "@/components/core/constants";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as workflowEngine from "@/components/workflow/workflowEngine";
// 컬럼 단위 정의
export interface DatasetColumn {
  key: string; // 항상 있어야 함
  type: "string" | "number" | "boolean" | "object"; // 항상 있어야 함
  bindingType?: "direct" | "ref";
  sourceNodeId?: string; // 바인딩 되어 있을때
}

// -------------------- 타입 정의 --------------------
export interface NodeDataTable {
  table: string;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
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
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
      return [{ table: "INDATA", columns: [], rows: [] }];
    case constants.workflowActions.SCRIPT:
      return [{ table: "INDATA", columns: [], rows: [] }];
    default:
      throw new Error(constants.messages.WORKFLOW_NOT_SUPPORTED_NODE_TYPE);
  }
}

export function getDefaultOutputs(actionName: string): NodeDataTable[] {
  switch (actionName) {
    case constants.workflowActions.START:
    case constants.workflowActions.CALL:
    case constants.workflowActions.END:
    default:
      return [{ table: "OUTDATA", columns: [], rows: [] }];
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

/* value (객체)의 모든 템플릿 {{}} 데이터(변수값)를 실제 값으로 치환 */
export function interpolate(value: any, ctx: any): any {
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

      // Node main action

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

  // SCRIPT
  registerAction(
    constants.workflowActions.SCRIPT,
    async (node, workflowData) => {
      const result = await new Promise((resolve, reject) => {
        const userScript = node.data?.script || `api.alert("no script")`;
        const timeoutMs = node.data?.timeoutMs || 5000;

        const blob = new Blob(
          [
            `
          onmessage = async (e) => {
            const { script, actionData, workflowData, timeoutMs } = e.data;
            const logs = [];
            try {
              const safeApi = {
                log: (...args) => logs.push(args.join(" ")),
                sleep: (ms) => new Promise(r => setTimeout(r, ms)),
                alert: (msg) => postMessage({"type":"alert", "message":msg})
              };

              const fn = new Function("actionData", "workflowData", "api", script);

              const output = await Promise.race([
                fn(actionData, workflowData, safeApi),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs))
              ]);

              postMessage({ ok: true, result: output, logs });
            } catch (err) {
              postMessage({ ok: false, error: err.message, logs });
            }
          };
        `,
          ],
          { type: "application/javascript" }
        );

        const worker = new Worker(URL.createObjectURL(blob));

        // 스크립트 타임아웃 처리
        const timer = setTimeout(() => {
          worker.terminate();
          reject(new Error("timeout"));
        }, timeoutMs + 100);

        worker.onmessage = (e) => {
          const msg = e.data;

          if (msg.type === "alert") {
            alert(msg.message);
            return;
          }

          clearTimeout(timer);
          worker.terminate();

          // 로그는 콘솔에 출력하거나 워크플로우 런타임에 저장
          if (msg.logs?.length) {
            msg.logs.forEach((line: string) => console.log("[SCRIPT]", line));
          }

          if (msg.ok) resolve(msg.result);
          else reject(new Error(msg.error));
        };

        // 스크립트 실행
        worker.postMessage({
          script: userScript,
          actionData: node.data || {},
          workflowData: workflowData.data || {},
          timeoutMs,
        });
      });

      workflowData.data.run.outputs = [result];
      postNodeCheck(node, workflowData);
    }
  );
}
