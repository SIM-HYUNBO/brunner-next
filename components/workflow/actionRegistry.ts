"use strict";

import * as constants from "@/components/core/constants";

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: any;
};

export type ActionHandler = (
  nodeId: string,
  actionName: string,
  actionData: Record<string, any>,
  workflowData: WorkflowContext
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, Record<string, any>>();

export function registerBuiltInActions(opts: Record<string, any> = {}): void {
  // step 실행 기록 유틸

  // 🔸 1. start
  registerAction(
    constants.workflowActions.START,
    async (nodeId, actionName, actionData, workflowData) => {
      workflowData._system = {};
      workflowData._system.workflowStatus = "started";
      workflowData._system.startTime = new Date().toISOString();
      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, {});

  // 🔸 2. end
  registerAction(
    constants.workflowActions.END,
    async (nodeId, actionName, actionData, workflowData) => {
      workflowData._system.workflowStatus = "end";
      workflowData._system.endTime = new Date().toISOString();
      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, {});

  // 🔸 3. httpRequest
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId, actionName, actionData, workflowData) => {
      const res = await fetch(actionData.url, {
        method: actionData.method || "GET",
        headers: actionData.headers || {},
        body: actionData.body ? JSON.stringify(actionData.body) : null,
      });

      const text = await res.text().catch(() => null);
      let data: any;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      workflowData.httpResponse = { status: res.status, data };
      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.HTTPREQUEST, {
    url: "/api/backendServer",
    method: constants.httpMethod.POST,
    headers: { "content-type": "application/json" },
    body: { commandName: "test" },
  });

  // 🔸 4. wait
  registerAction(
    constants.workflowActions.SLEEP,
    async (nodeId, actionName, actionData, workflowData) => {
      await new Promise((resolve) => setTimeout(resolve, actionData.ms || 300));
      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, { ms: 300 });

  // 🔸 5. setVar
  registerAction(
    constants.workflowActions.ASSIGN,
    async (nodeId, actionName, actionData, workflowData) => {
      const keys = actionData.path.split(".");
      let target: Record<string, any> = workflowData;
      for (let i = 0; i < keys.length - 1; i++)
        target = target[keys[i]] ?? (target[keys[i]] = {});
      target[keys[keys.length - 1]] = actionData.value;

      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.ASSIGN, {
    path: "",
    value: null,
  });

  // 🔸 6. mergeObjects
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId, actionName, actionData, workflowData) => {
      const base = getByPath(workflowData, actionData.basePath) || {};
      const extra = getByPath(workflowData, actionData.extraPath) || {};
      const result = { ...base, ...extra };
      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, result);

      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.MERGE, {
    basePath: "",
    extraPath: "",
    outputPath: "",
  });

  // 🔸 7. branch
  registerAction(
    constants.workflowActions.BRANCH,
    async (nodeId, actionName, actionData, workflowData) => {
      const value = actionData.condition
        ? actionData.trueValue
        : actionData.falseValue;
      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, value);

      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.BRANCH, {
    condition: true,
    trueValue: null,
    falseValue: null,
    outputPath: "",
  });

  // 🔸 8. mathOp
  registerAction(
    constants.workflowActions.MATHOP,
    async (nodeId, actionName, actionData, workflowData) => {
      const left = resolveValue(actionData.left, workflowData);
      const right = resolveValue(actionData.right, workflowData);
      let result: number | null;
      switch (actionData.op) {
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
          result = right !== 0 ? left / right : null;
          break;
        default:
          throw new Error(`Unknown math op: ${actionData.op}`);
      }
      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, result);

      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );
  // 🔸 9. call
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId, actionName, actionData, workflowData) => {
      let result: any = null;

      // Call other workflow

      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, result);

      actionLogging(nodeId, actionName, actionData, workflowData);
      return workflowData;
    }
  );

  defaultParamsMap.set(constants.workflowActions.MATHOP, {
    op: "add",
    left: "${}",
    right: "${}",
    outputPath: "",
  });

  defaultParamsMap.set(constants.workflowActions.CALL, {
    workflow: {},
    input: {},
  });
}

// --- 공용 유틸 ---
function actionLogging(
  nodeId: string,
  actionName: string,
  actionData: any,
  workflowData: any
) {
  console.log(
    `Execute Workflow Node [${nodeId}] Action [${actionName}, actionData:${JSON.stringify(
      actionData,
      null,
      2
    )}, workflowData:${JSON.stringify(workflowData, null, 2)}]`
  );
}

export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}
export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}
export function getDefaultParams(actionName: string): Record<string, any> {
  return defaultParamsMap.get(actionName) || {};
}

// --- 경로 처리 ---
function getByPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}
function setByPath(obj: Record<string, any>, path: string, value: any): void {
  const keys: any = path.split(".");
  let target: Record<string, any> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]] || typeof target[keys[i]] !== "object")
      target[keys[i]] = {};
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;
}
function resolveValue(val: any, workflowData: Record<string, any>): any {
  if (typeof val !== "string") return val;
  const match = /^\$\{(.+)\}$/.exec(val);
  if (match && match[1]) return getByPath(workflowData, match[1]);
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}
