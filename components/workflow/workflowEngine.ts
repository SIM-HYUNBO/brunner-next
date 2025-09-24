import {
  getAction,
  registerBuiltInActions,
} from "@/components/workflow/actionRegistry";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";

registerBuiltInActions();

// 객체 경로로 값 가져오기
function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

/** value (객체)의 모든 템플릿 {{}} 데이터를 실제 값으로 치환 */
function interpolate(value: any, ctx: any): any {
  if (typeof value === "string") {
    return value.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const v = getByPath(ctx, key.trim());
      return v == null ? "" : String(v);
    });
  }

  if (Array.isArray(value)) return value.map((v: any) => interpolate(v, ctx));

  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    Object.keys(value).forEach((k) => {
      out[k] = interpolate(value[k], ctx);
    });
    return out;
  }

  return value;
}

// 조건 평가
function evalCondition(cond: any, ctx: any) {
  if (!cond) return true;
  const res = interpolate(cond, ctx).trim().toLowerCase();
  return res !== "" && res !== "false" && res !== "0";
}

// 워크플로우 실행
export async function runWorkflowStep(node: Node<any>, workflowData: any) {
  // 실행 컨텍스트 생성
  const ctxInterp = {
    inputs: workflowData.inputs || {},
    globals: workflowData.globals || {},
    user: workflowData.user || {},
    lastResult: workflowData.lastResult,
  };

  // 조건(if) 확인
  if (!evalCondition(node.data.if, ctxInterp)) {
    return workflowData; // 조건 불일치 → 실행하지 않음
  }

  // 액션 찾기
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  // 파라미터 보간 처리
  const stepInputs = interpolate(node.data.inputs || {}, ctxInterp);
  let result: any = null;

  try {
    result = await action(node.id, stepInputs, workflowData);
    mergeDeepOverwrite(node.data.outputs, result);
    return result;
  } catch (err) {
    if (node.data.continueOnError) {
      console.error("Step error ignored:", err);
      return err;
    } else {
      throw err;
    }
  }
}

function mergeDeepOverwrite(
  target: Record<string, any>,
  source: Record<string, any>
) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // A에 해당 키가 없거나 객체가 아니면 (새 객체 생성)
      if (
        !target[key] ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        target[key] = {};
      }
      // 재귀 호출
      mergeDeepOverwrite(target[key], source[key]);
    } else {
      // 기본 값 덮어쓰기
      target[key] = source[key];
    }
  }
  return target;
}
