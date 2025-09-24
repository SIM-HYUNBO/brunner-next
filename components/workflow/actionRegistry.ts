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

export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  inputs: NodeInputField[];
  outputs: NodeOutputField[];
}

export interface ConditionEdgeData {
  condition?: string;
}

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

// 기본 입력값 반환 함수 (없으면 빈 배열 반환)
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
        { key: "path", type: "direct", value: "" }, // 변수 경로
        { key: "value", type: "direct", value: "" }, // 설정할 값
      ];
    case constants.workflowActions.MERGE:
      return [
        { key: "targetPath", type: "direct", value: "" }, // 병합 대상 객체 경로
        { key: "value", type: "direct", value: {} }, // 병합할 객체
      ];
    case constants.workflowActions.BRANCH:
      return [
        { key: "condition", type: "direct", value: "" },
        // 선택적으로 다른 노드를 지정할 수 있음
        { key: "trueNodeId", type: "direct", value: "" },
        { key: "falseNodeId", type: "direct", value: "" },
      ];
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
      return []; // 기본 입력값 없음
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
    case constants.workflowActions.MERGE:
    case constants.workflowActions.BRANCH:
    case constants.workflowActions.MATHOP:
    case constants.workflowActions.CALL:
    default:
      return [];
  }
}

export function registerBuiltInActions(opts: Record<string, any> = {}): void {
  const mapToObj = (map: Map<any, any>) => {
    return Object.fromEntries(map);
  };

  // step 실행 기록 유틸

  // 🔸 1. start
  registerAction(
    constants.workflowActions.START,
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      actionLogging(nodeId, stepInputs, workflowData);

      // START는 입력받은 파라미터 데이터를 그대로 출력 파라미터에 저장
      return stepInputs;
    }
  );
  defaultParamsMap.set(constants.workflowActions.START, {});

  // 🔸 2. end
  registerAction(
    constants.workflowActions.END,
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      actionLogging(nodeId, stepInputs, workflowData);

      // END는 출력 파라미터 데이터를 최종 출력으로 저장해야 함.
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.END, {});

  // 🔸 3. httpRequest
  registerAction(
    constants.workflowActions.HTTPREQUEST,
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      const res = await fetch(stepInputs.url, {
        method: stepInputs.method || "GET",
        headers: stepInputs.headers || {},
        body: stepInputs.body ? JSON.stringify(stepInputs.body) : null,
      });
      const result = await res.text();
      const jResult = JSON.parse(result);

      workflowData.__ACTION_RETURNS.set(nodeId, jResult);
      actionLogging(nodeId, stepInputs, workflowData);
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
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      await new Promise((resolve) => setTimeout(resolve, stepInputs.ms || 300));

      // 별도 리턴은 없음

      actionLogging(nodeId, stepInputs, workflowData);
      return workflowData;
    }
  );
  defaultParamsMap.set(constants.workflowActions.SLEEP, { ms: 300 });

  // 🔸 5. Set
  registerAction(
    constants.workflowActions.SET,
    async (nodeId: string, stepInputs: SetStepParams, workflowData: any) => {
      const actions = Array.isArray(stepInputs) ? stepInputs : [stepInputs]; // 배열로 강제 변환

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

      actionLogging(nodeId, stepInputs, workflowData);
      return workflowData;
    }
  );

  defaultParamsMap.set(constants.workflowActions.SET, [
    { path: "team.leader", value: "Alice" },
    { path: "team.members", value: ["Bob", "Charlie"] },
  ]);

  // 🔸 6. mergeObjects
  registerAction(
    constants.workflowActions.MERGE,
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      const base = getByPath(workflowData, stepInputs.basePath) || {};
      const extra = getByPath(workflowData, stepInputs.extraPath) || {};
      const result = { ...base, ...extra };
      if (stepInputs.outputPath)
        setByPath(workflowData, stepInputs.outputPath, result);

      actionLogging(nodeId, stepInputs, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
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
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      const value = stepInputs.condition
        ? stepInputs.trueValue
        : stepInputs.falseValue;

      if (stepInputs.outputPath)
        setByPath(workflowData, stepInputs.outputPath, value);

      actionLogging(nodeId, stepInputs, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, value);
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
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      const actionName = "";
      const left = resolveValue(stepInputs.left, workflowData);
      const right = resolveValue(stepInputs.right, workflowData);
      let result: number | null;
      switch (stepInputs.op) {
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
          throw new Error(`Unknown math op: ${stepInputs.op}`);
      }
      if (stepInputs.outputPath)
        setByPath(workflowData, stepInputs.outputPath, result);

      actionLogging(nodeId, stepInputs, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
      return workflowData;
    }
  );
  // 🔸 9. call
  registerAction(
    constants.workflowActions.CALL,
    async (nodeId: string, stepInputs: any, workflowData: any) => {
      // 다른 워크플로우를 호출하고 결과값을 저장
      let result: any = null;

      // Call other workflow

      if (stepInputs.outputPath)
        setByPath(workflowData, stepInputs.outputPath, result);

      actionLogging(nodeId, stepInputs, workflowData);

      workflowData.__ACTION_RETURNS.set(nodeId, result);
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
function actionLogging(nodeId: string, stepInputs: any, workflowData: any) {
  console.log(
    `Execute Workflow Node [${nodeId}] Action [${
      stepInputs.actionName
    }, stepInputs:${JSON.stringify(
      stepInputs,
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
