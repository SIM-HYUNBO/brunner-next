`use strict`;

import {
  getAction,
  registerBuiltInActions,
} from "@/components/workflow/actionRegistry";

function getByPath(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

function interpolate(value, ctx) {
  if (typeof value === "string") {
    return value.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const v = getByPath(ctx, key.trim());
      return v == null ? "" : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => interpolate(v, ctx));
  if (value && typeof value === "object") {
    const out = {};
    Object.keys(value).forEach((k) => (out[k] = interpolate(value[k], ctx)));
    return out;
  }
  return value;
}

function evalCondition(cond, ctx) {
  if (!cond) return true;
  const res = interpolate(cond, ctx).trim().toLowerCase();
  return res !== "" && res !== "false" && res !== "0";
}

export async function runWorkflow(workflow, context) {
  registerBuiltInActions();
  const ctxInterp = {
    input: context.input || {},
    globals: context.globals || {},
    user: context.user || {},
    lastResult: undefined,
  };

  for (const step of workflow.steps) {
    if (!evalCondition(step.if, ctxInterp)) continue;

    const action = getAction(step.actionName);
    if (!action) throw new Error(`Unknown action: ${step.actionName}`);
    const params = interpolate(step.params || {}, ctxInterp);

    try {
      const result = await action(step.actionName, params, context);
      ctxInterp.lastResult = result;
    } catch (err) {
      if (step.continueOnError) {
        console.error("Step error ignored:", err);
        continue;
      } else {
        throw err;
      }
    }
  }
  return ctxInterp.lastResult;
}
