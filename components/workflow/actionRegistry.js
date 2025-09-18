`use strict`;

import constants from "@/components/core/constants";

const actionMap = new Map();

export function registerBuiltInActions(opts = {}) {
  // 🔸 1. callApi
  registerAction(
    constants.workflowActions.httpRequest,
    async (actionName, params, ctx) => {
      console.log(`Execute Workflow Action [${actionName}]`);
      const res = await fetch(params.url, {
        method: params.method || "GET",
        headers: params.headers || {},
        body: params.body ? JSON.stringify(params.body) : undefined,
      });
      const text = await res.text().catch(() => null);
      try {
        return { status: res.status, data: text ? JSON.parse(text) : null };
      } catch {
        return { status: res.status, data: text };
      }
    }
  );

  // 🔸 2. showToast
  registerAction(
    constants.workflowActions.showToast,
    (actionName, params, ctx) => {
      console.log(`Execute Workflow Action [${actionName}]`);
      const fn = opts.toast || ((m) => console.log("toast:", m));
      fn(params.message);
    }
  );

  // 🔸 3. navigate
  registerAction(
    constants.workflowActions.navigate,
    (actionName, params, ctx) => {
      console.log(`Execute Workflow Action [${actionName}]`);
      if (!ctx.router) throw new Error("navigate requires router");
      return ctx.router.push(params.target);
    }
  );

  // 🔸 4. wait (고침: Promise 반환하도록 수정)
  registerAction(constants.workflowActions.wait, (actionName, params) => {
    console.log(`Execute Workflow Action [${actionName}]`);
    return new Promise((r) => setTimeout(r, params.ms || 300));
  });

  // 🔸 5. log
  registerAction(constants.workflowActions.log, async (actionName, params) => {
    console.log(`Execute Workflow Action [${actionName}]`, params.message);
    return params.message;
  });

  // 🔸 6. setVar
  registerAction(
    constants.workflowActions.setVar,
    async (actionName, params, ctx) => {
      const keys = params.path.split(".");
      let target = ctx;
      for (let i = 0; i < keys.length - 1; i++) {
        target = target[keys[i]] ?? (target[keys[i]] = {});
      }
      target[keys[keys.length - 1]] = params.value;
      return params.value;
    }
  );

  // 🔸 7. mergeObjects
  registerAction(
    constants.workflowActions.mergeObjects,
    async (actionName, params) => {
      return { ...params.base, ...params.extra };
    }
  );

  // 🔸 8. branch
  registerAction(
    constants.workflowActions.branch,
    async (actionName, params) => {
      return params.condition ? params.trueValue : params.falseValue;
    }
  );

  // 🔸 9. mathOp
  registerAction(
    constants.workflowActions.mathOp,
    async (actionName, params) => {
      const { op, a, b } = params;
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

  // 🔸 10. callWorkflow
  registerAction(
    constants.workflowActions.callWorkflow,
    async (actionName, params, ctx) => {
      if (!ctx.runWorkflow)
        throw new Error("callWorkflow requires ctx.runWorkflow");
      return await ctx.runWorkflow(params.workflow, {
        ...ctx,
        input: params.input ?? {},
      });
    }
  );
}

// 공용 유틸
export function registerAction(name, handler) {
  actionMap.set(name, handler);
}

export function getAction(name) {
  return actionMap.get(name);
}
