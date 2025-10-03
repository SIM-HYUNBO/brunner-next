"use strict";

import * as constants from "@/components/core/constants";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as commonData from "@/components/core/commonData";

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: commonData.NodeDataTable[];
  output?: commonData.NodeDataTable[];
};

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  node: Node<any>,
  workflow: any,
  txInstance?: any
) => Promise<void>;

export const actionMap = new Map<string, ActionHandler>();
export const defaultParamsMap = new Map<string, commonData.NodeDataTable[]>();

// -------------------- 액션 등록 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}

export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}

export function getDefaultParams(
  actionName: string
): commonData.NodeDataTable[] {
  return defaultParamsMap.get(actionName) || [];
}

// 객체 경로로 값 가져오기
export function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
export function setByPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let target = obj;
  for (let i: number = 0; i < keys.length - 1; i++) {
    if (!target[String(keys[i])]) target[String(keys[i])] = {};
    target = target[String(keys[i])];
  }
  target[String(keys[keys.length - 1])] = value;
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
      workflowData.data.run.system = {};
      workflowData.data.run.system.startTime = new Date();

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
    workflowData.data.run.system.endTime = new Date();
    workflowData.data.run.system.durationMs =
      workflowData.data.run.system.endTime.getTime() -
      workflowData.data.run.system.startTime.getTime();

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

  // safe Api

  /* 
    log(...) – 워커 내부 로그 저장
    alert(msg) – 메인 스레드 alert
    sleep(ms) – 비동기 지연
    getGlobalVar(path) / setGlobalVar(path, value) – 워크플로우 전역 변수(workflowData) 아래 패스로 경로 접근
    getVar(path) / setVar(path, value) – 해당 노드 변수(node) 아래 패스로 경로 접근
    now() – 현재 Date 객체
    timestamp() – 현재 timestamp (ms)
    random(min, max) – 난수 생성
    clone(obj) – 안전한 깊은 복사
    jsonParse(str) / jsonStringify(obj) – JSON 처리
    formatDate(date, fmt) – 날짜 포맷(간단 예시)
  */
  registerAction(
    constants.workflowActions.SCRIPT,
    async (node: any, workflowData: any) => {
      const userScript: string =
        node.data?.script ||
        `
      const body = {
        title: "sim",
        body: "hyunbo",
        age: 50
      }

      const response = await api.postJson(
        "https://jsonplaceholder.typicode.com/posts",
        body
      );
      api.setVar("data.run.output", response);
      `;

      const timeoutMs: number = node.data?.timeoutMs || 5000;

      // 유틸 함수들 타입 명시
      function getByPath(obj: Record<string, any>, path: string): any {
        return path
          .split(".")
          .reduce((o, k) => (o != null ? o[k] : undefined), obj);
      }

      function setByPath(
        obj: Record<string, any>,
        path: string,
        value: any
      ): void {
        const keys: string[] = path.split(".");
        let target: Record<string, any> = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!target[String(keys[i])]) target[String(keys[i])] = {};
          target = target[String(keys[i])] as Record<string, any>;
        }
        target[String(keys[keys.length - 1])] = value;
      }

      const logs: string[] = [];

      const safeApi = {
        log: (...args: any[]) => logs.push(args.join(" ")),
        sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
        getGlobalVar: (path: string) => getByPath(workflowData, path),
        setGlobalVar: (path: string, value: any) =>
          setByPath(workflowData, path, value),
        getVar: (path: string) => getByPath(node, path),
        setVar: (path: string, value: any) => setByPath(node, path, value),
        now: (): Date => new Date(),
        timestamp: (): number => Date.now(),
        random: (min: number = 0, max: number = 1): number =>
          Math.random() * (max - min) + min,
        clone: (obj: any): any => JSON.parse(JSON.stringify(obj)),
        jsonParse: (str: string): any => JSON.parse(str),
        jsonStringify: (obj: any): string => JSON.stringify(obj),
        formatDate: (date: Date, fmt: string): string => date.toISOString(),
        postJson: async (url: string, body: any): Promise<any> => {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          return await res.json();
        },
      };

      const AsyncFunction = Object.getPrototypeOf(async function () {})
        .constructor as any;
      const fn = new AsyncFunction(
        "actionData",
        "workflowData",
        "api",
        userScript
      );

      try {
        const result = await Promise.race([
          fn(node.data || {}, workflowData.data || {}, safeApi),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), timeoutMs)
          ),
        ]);

        logs.forEach((line: string) => console.log("[SCRIPT]", line));

        workflowData.data.run.outputs = [result];
        postNodeCheck(node, workflowData);
      } catch (err: any) {
        console.error("[SCRIPT ERROR]", err.message);
        alert("스크립트 실행 오류: " + err.message);
        throw err;
      }
    }
  );
}
