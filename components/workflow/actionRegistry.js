`use strict`;

const registry = new Map();

export function registerAction(name, handler) {
  registry.set(name, handler);
}

export function getAction(name) {
  return registry.get(name);
}

// 기본 액션 등록
export function registerBuiltInActions(opts = {}) {
  let actionName = "callApi";
  registerAction(actionName, async (actionName, params, ctx) => {
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
  });

  actionName = "showToast";
  registerAction(actionName, (actionName, params, ctx) => {
    console.log(`Execute Workflow Action [${actionName}]`);
    const fn = opts.toast || ((m) => console.log("toast:", m));
    fn(params.message);
  });

  actionName = "navigate";
  registerAction(actionName, (actionName, params, ctx) => {
    console.log(`Execute Workflow Action [${actionName}]`);
    if (!ctx.router) throw new Error("navigate requires router");
    return ctx.router.push(params.target);
  });

  actionName = "wait";
  registerAction("wait", (actionName, params, ctx) => {
    console.log(`Execute Workflow Action [${actionName}]`);
    new Promise((r) => setTimeout(r, params.ms || 300));
  });
}
