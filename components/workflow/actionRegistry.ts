"use strict";

import * as constants from "@/components/core/constants";

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: any;
};

interface SetStepParamItem {
  path: string;
  value: any;
}
type SetStepParams = SetStepParamItem | SetStepParamItem[];

export type ActionHandler = (
  nodeId: string,
  actionData: any,
  workflowData: WorkflowContext
) => Promise<WorkflowContext> | WorkflowContext;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, Record<string, any>>();

export function registerBuiltInActions(opts: Record<string, any> = {}): void {
  const mapToObj = (map: Map<any, any>) => {
    return Object.fromEntries(map);
  };

  // step 실행 기록 유틸

  // 🔸 1. start
  registerAction(
    constants.workflowActions.START,
    async (nodeId: string, stepParams: any, workflowData: any) => {
      workflowData.__SYSTEM = {};
      workflowData.__ACTION_RETURNS = new Map();

      workflowData.__SYSTEM.workflowStatus = constants.workflowStatus.Started;
      workflowData.__SYSTEM.startTime = new Date().toISOString();
      workflowData.__ACTION_RETURNS.set(nodeId, {
        startTime: workflowData.__SYSTEM.startTime,
      });

      actionLogging(nodeId, stepParams, workflowData);
      return workflowData.__ACTION_RETURNS.get(nodeId);
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, {});

  // 🔸 2. end
  registerAction(
    constants.workflowActions.END,
    async (nodeId: string, stepParams: any, workflowData: any) => {
      workflowData.__SYSTEM.workflowStatus = constants.workflowStatus.End;
      workflowData.__SYSTEM.endTime = new Date().toISOString();
      workflowData.__SYSTEM.durationMs =
        new Date(workflowData.__SYSTEM.endTime).getTime() -
        new Date(workflowData.__SYSTEM.startTime).getTime();

      workflowData.__ACTION_RETURNS.set(nodeId, {
        endTime: workflowData.__SYSTEM.endTime,
        durationMs: workflowData.__SYSTEM.durationMs,
      });

      actionLogging(nodeId, stepParams, workflowData);
      workflowData.__ACTION_RETURNS = mapToObj(workflowData.__ACTION_RETURNS);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, {});

  // 🔸 3. httpRequest
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId: string, stepParams: any, workflowData: any) => {
      const res = await fetch(stepParams.url, {
        method: stepParams.method || "GET",
        headers: stepParams.headers || {},
        body: stepParams.body ? JSON.stringify(stepParams.body) : null,
      });
      const result = await res.text();
      const jResult = JSON.parse(result);

      workflowData.__ACTION_RETURNS.set(nodeId, jResult);
      actionLogging(nodeId, stepParams, workflowData);
      return workflowData.__ACTION_RETURNS.get(nodeId);
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
    async (nodeId: string, stepParams: any, workflowData: any) => {
      await new Promise((resolve) => setTimeout(resolve, stepParams.ms || 300));

      // 별도 리턴은 없음
      workflowData.__ACTION_RETURNS.set(nodeId, null);

      actionLogging(nodeId, stepParams, workflowData);
      return workflowData.__ACTION_RETURNS.get(nodeId);
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, { ms: 300 });

  // 🔸 5. Set
  registerAction(
    constants.workflowActions.SET,
    async (nodeId: string, stepParams: SetStepParams, workflowData: any) => {
      const actions = Array.isArray(stepParams) ? stepParams : [stepParams]; // 배열로 강제 변환

      let ret: any = {};

      for (const { path, value } of actions) {
        const keys: string[] = path.split(".");
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
          ret[lastKey] = value;
        }
      }
      workflowData.__ACTION_RETURNS.set(nodeId, ret);

      actionLogging(nodeId, stepParams, workflowData);
      return workflowData.__ACTION_RETURNS.get(nodeId);
    }
  );

  defaultParamsMap.set(constants.workflowActions.SET, [
    { path: "team.leader", value: "Alice" },
    { path: "team.members", value: ["Bob", "Charlie"] },
  ]);

  // 🔸 6. mergeObjects
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId: string, stepParams: any, workflowData: any) => {
      const base = getByPath(workflowData, stepParams.basePath) || {};
      const extra = getByPath(workflowData, stepParams.extraPath) || {};
      const result = { ...base, ...extra };
      if (stepParams.outputPath)
        setByPath(workflowData, stepParams.outputPath, result);

      actionLogging(nodeId, stepParams, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
      return workflowData.__ACTION_RETURNS.get(nodeId);
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
    async (nodeId: string, stepParams: any, workflowData: any) => {
      const value = stepParams.condition
        ? stepParams.trueValue
        : stepParams.falseValue;

      if (stepParams.outputPath)
        setByPath(workflowData, stepParams.outputPath, value);

      actionLogging(nodeId, stepParams, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, value);
      return workflowData.__ACTION_RETURNS.get(nodeId);
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
    async (nodeId: string, stepParams: any, workflowData: any) => {
      const actionName = "";
      const left = resolveValue(stepParams.left, workflowData);
      const right = resolveValue(stepParams.right, workflowData);
      let result: number | null;
      switch (stepParams.op) {
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
          throw new Error(`Unknown math op: ${stepParams.op}`);
      }
      if (stepParams.outputPath)
        setByPath(workflowData, stepParams.outputPath, result);

      actionLogging(nodeId, stepParams, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
      return workflowData.__ACTION_RETURNS.get(nodeId);
    }
  );
  // 🔸 9. call
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId: string, stepParams: any, workflowData: any) => {
      // 다른 워크플로우를 호출하고 결과값을 저장
      let result: any = null;

      // Call other workflow

      if (stepParams.outputPath)
        setByPath(workflowData, stepParams.outputPath, result);

      actionLogging(nodeId, stepParams, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
      return workflowData.__ACTION_RETURNS.get(nodeId);
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
function actionLogging(nodeId: string, stepParams: any, workflowData: any) {
  console.log(
    `Execute Workflow Node [${nodeId}] Action [${
      stepParams.actionName
    }, stepParams:${JSON.stringify(
      stepParams,
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
