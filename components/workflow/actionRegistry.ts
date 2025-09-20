"use strict";

import * as constants from "@/components/core/constants";

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: any;
};

export type ActionHandler = (
  actionName: string,
  actionData: Record<string, any>,
  workflowData: WorkflowContext
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, Record<string, any>>();

export function registerBuiltInActions(opts: Record<string, any> = {}): void {
  // step 실행 기록 유틸
  const recordStep = async (
    actionName: string,
    actionData: any,
    workflowData: WorkflowContext
  ) => {
    const stepId = await generateStepId(workflowData);
    workflowData.steps = workflowData.steps || [];
    workflowData.steps.push({
      id: stepId,
      name: actionName,
      timestamp: new Date().toISOString(),
      data: actionData,
    });
    return workflowData;
  };

  // 🔸 1. start
  registerAction(
    constants.workflowActions.start,
    async (actionName, actionData, workflowData) => {
      workflowData.workflowStatus = "started";
      workflowData.startTime = new Date().toISOString();
      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.start, {});

  // 🔸 2. end
  registerAction(
    constants.workflowActions.end,
    async (actionName, actionData, workflowData) => {
      workflowData.workflowStatus = "end";
      workflowData.endTime = new Date().toISOString();
      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.end, {});

  // 🔸 3. httpRequest
  registerAction(
    constants.workflowActions.httpRequest,
    async (actionName, actionData, workflowData) => {
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
      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.httpRequest, {
    url: "/api/backendServer",
    method: constants.httpMethod.POST,
    headers: { "content-type": "application/json" },
    body: { commandName: "test" },
  });

  // 🔸 4. wait
  registerAction(
    constants.workflowActions.wait,
    async (actionName, actionData, workflowData) => {
      await new Promise((resolve) => setTimeout(resolve, actionData.ms || 300));
      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.wait, { ms: 300 });

  // 🔸 5. setVar
  registerAction(
    constants.workflowActions.setVar,
    async (actionName, actionData, workflowData) => {
      const keys = actionData.path.split(".");
      let target: Record<string, any> = workflowData;
      for (let i = 0; i < keys.length - 1; i++)
        target = target[keys[i]] ?? (target[keys[i]] = {});
      target[keys[keys.length - 1]] = actionData.value;

      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.setVar, {
    path: "",
    value: null,
  });

  // 🔸 6. mergeObjects
  registerAction(
    constants.workflowActions.mergeObjects,
    async (actionName, actionData, workflowData) => {
      const base = getByPath(workflowData, actionData.basePath) || {};
      const extra = getByPath(workflowData, actionData.extraPath) || {};
      const result = { ...base, ...extra };
      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, result);

      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.mergeObjects, {
    basePath: "",
    extraPath: "",
    outputPath: "",
  });

  // 🔸 7. branch
  registerAction(
    constants.workflowActions.branch,
    async (actionName, actionData, workflowData) => {
      const value = actionData.condition
        ? actionData.trueValue
        : actionData.falseValue;
      if (actionData.outputPath)
        setByPath(workflowData, actionData.outputPath, value);

      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.branch, {
    condition: true,
    trueValue: null,
    falseValue: null,
    outputPath: "",
  });

  // 🔸 8. mathOp
  registerAction(
    constants.workflowActions.mathOp,
    async (actionName, actionData, workflowData) => {
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

      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.mathOp, {
    op: "add",
    left: "${}",
    right: "${}",
    outputPath: "",
  });

  // 🔸 9. callWorkflow
  registerAction(
    constants.workflowActions.callWorkflow,
    async (actionName, actionData, workflowData) => {
      if (!workflowData.runWorkflow)
        throw new Error("callWorkflow requires workflowData.runWorkflow");

      const result = await workflowData.runWorkflow(actionData.workflow, {
        ...workflowData,
        input: actionData.input ?? {},
      });
      Object.assign(workflowData, result);

      await recordStep(actionName, actionData, workflowData);
      actionLogging(actionName, actionData, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.callWorkflow, {
    workflow: {},
    input: {},
  });
}

// --- 공용 유틸 ---
function actionLogging(actionName: string, actionData: any, workflowData: any) {
  console.log(
    `Execute Workflow Action [${actionName}, actionData:${JSON.stringify(
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

// --- stepId 생성 ---
async function generateStepId(workflowData: WorkflowContext) {
  workflowData._stepCounter = (workflowData._stepCounter || 0) + 1;
  return workflowData._stepCounter;
}
