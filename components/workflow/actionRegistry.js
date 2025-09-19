`use strict`;

import * as constants from "@/components/core/constants";

export const actionMap = new Map();

export function registerBuiltInActions(opts = {}) {
  // 🔸 1. start
  registerAction(
    constants.workflowActions.start,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      return { workflowStatus: "started" };
    }
  );
  // 🔸 2. end
  registerAction(
    constants.workflowActions.end,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      return { workflowStatus: "end" };
    }
  );

  // 🔸 3. callApi
  registerAction(
    constants.workflowActions.httpRequest,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      const res = await fetch(actionData.url, {
        method: actionData.method || "GET",
        headers: actionData.headers || {},
        body: actionData.body ? JSON.stringify(actionData.body) : undefined,
      });
      const text = await res.text().catch(() => null);
      try {
        return { status: res.status, data: text ? JSON.parse(text) : null };
      } catch {
        return { status: res.status, data: text };
      }
    }
  );

  // 🔸 4. showToast
  registerAction(
    constants.workflowActions.showToast,
    (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      const fn = opts.toast || ((m) => console.log("toast:", m));
      fn(actionData.message);
    }
  );

  // 🔸 5. navigate
  registerAction(
    constants.workflowActions.navigate,
    (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      if (!workflowData.router) throw new Error("navigate requires router");
      return workflowData.router.push(actionData.target);
    }
  );

  // 🔸 6. wait (고침: Promise 반환하도록 수정)
  registerAction(
    constants.workflowActions.wait,
    (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      return new Promise((r) => setTimeout(r, actionData.ms || 300));
    }
  );

  // 🔸 7. log
  registerAction(
    constants.workflowActions.log,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      return actionData.message;
    }
  );

  // 🔸 8. setVar
  registerAction(
    constants.workflowActions.setVar,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);

      const keys = actionData.path.split(".");
      let target = workflowData;
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]] ?? (target[keys[i]] = {});
      }
      target[keys[keys.length - 1]] = actionData.value;
      return actionData.value;
    }
  );

  // 🔸 9. mergeObjects
  registerAction(
    constants.workflowActions.mergeObjects,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);
      return { ...actionData.base, ...actionData.extra };
    }
  );

  // 🔸 10. branch
  registerAction(
    constants.workflowActions.branch,
    async (actionName, params, workflowData) => {
      actionLogging(actionName, params, workflowData);
      return params.condition ? params.trueValue : params.falseValue;
    }
  );

  // 🔸 11. mathOp
  registerAction(
    constants.workflowActions.mathOp,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);

      const { op, a, b } = actionData;
      switch (op) {
        case "add":
          return a + b;
        case "sub":
          return a - b;
        case "mul":
          return a * b;
        case "div":
          return b !== 0 ? a / b : null;
        default:
          throw new Error(`Unknown math op: ${op}`);
      }
    }
  );

  // 🔸 12. callWorkflow
  registerAction(
    constants.workflowActions.callWorkflow,
    async (actionName, actionData, workflowData) => {
      actionLogging(actionName, actionData, workflowData);

      if (!workflowData.runWorkflow)
        throw new Error("callWorkflow requires ctx.runWorkflow");
      return await workflowData.runWorkflow(actionData.workflow, {
        ...workflowData,
        input: actionData.input ?? {},
      });
    }
  );
}

function actionLogging(actionName, actionData, workflowData) {
  console.log(
    `Execute Workflow Action 
[${actionName}, 
actionData:${JSON.stringify(actionData, null, 2)}, 
workflowData:${JSON.stringify(workflowData, null, 2)}]`
  );
}

// 공용 유틸
export function registerAction(name, handler) {
  actionMap.set(name, handler);
}

export function getAction(name) {
  return actionMap.get(name);
}
