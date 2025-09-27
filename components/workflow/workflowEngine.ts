import {
  getAction,
  registerBuiltInActions,
} from "@/components/workflow/actionRegistry";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as constants from "@/components/core/constants";
import * as actionRegistry from "@/components/workflow/actionRegistry";

registerBuiltInActions();

export async function executeWorkflow(
  workflow: any = [],
  setRunningNodeIds: any = null
) {
  const nodesList: Node<any>[] = workflow.nodes;
  const edgesList: Edge<any>[] = workflow.edges;

  // 입력 검증
  if (
    !validationDataFormat(workflow.data.design.input, workflow.data.run.input)
  ) {
    throw new Error(`Invalid data structure.`);
    return null;
  }

  const startNode = nodesList.find(
    (n) => n.data.actionName === constants.workflowActions.START
  );

  if (!startNode) {
    throw new Error(constants.messages.WORKFLOW_STARTNODE_NOT_FOUND);
    return null;
  }

  const edgeMap: Record<string, Edge<any>[]> = {};
  edgesList.forEach((e) => {
    if (!e.source) return;
    if (!edgeMap[e.source]) edgeMap[e.source] = [];
    edgeMap[e.source]!.push(e);
  });

  const visitedNodes = new Set<string>();
  async function traverse(nodeId: string) {
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);

    const node = nodesList.find((n) => n.id === nodeId);
    if (!node) return;

    const shouldRun = !node.data.if || Boolean(node.data.if);
    let result: any = null;

    if (shouldRun && setRunningNodeIds) {
      setRunningNodeIds((prev: any) => [...prev, nodeId]);
      result = await runWorkflowStep(node, workflow);
      setRunningNodeIds((prev: any) => prev.filter((id: any) => id !== nodeId));
    }

    const outgoingEdges = edgeMap[nodeId] || [];
    for (const edge of outgoingEdges) {
      if (!edge.data?.condition || Boolean(edge.data.condition))
        await traverse(edge.target);
    }
    return result;
  }

  await traverse(startNode.id);
  return workflow;
}

// 워크플로우 실행
async function runWorkflowStep(node: Node<any>, workflowData: any) {
  // 액션 찾기
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  let result: any = null;

  try {
    result = await action(node, workflowData);
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

export async function executeNextNode(
  workflowData: any,
  setRunningNodeIds: any = null
) {
  // 실행할 노드 찾기
  let node: Node<any> | null;

  if (!workflowData.currentNodeId) {
    node =
      workflowData.nodes.find(
        (n: any) => n.data.actionName === constants.workflowActions.START
      ) || null;
  } else {
    const edge = workflowData.edges.find(
      (e: any) => e.source === workflowData.currentNodeId
    );
    node = edge
      ? workflowData.nodes.find((n: any) => n.id === edge.target) || null
      : null;
  }

  if (!node) {
    throw new Error(constants.messages.WORKFLOW_NODE_NOT_FOUND);
  }

  workflowData.currentNodeId = node.id;

  try {
    const runInputs = actionRegistry.interpolate(
      node.data.design.inputs || {},
      workflowData
    );
    node.data.run = { ...node.data.run, inputs: runInputs };

    setRunningNodeIds((prev: any) => [...prev, node.id]);
    await runWorkflowStep(node, workflowData);
    setTimeout(() => {
      // 비즈니스 트랜잭션에서는 노드 실행상태 확인을 위해 실행중인 노드 색깔 표시를 0.02초 유지
      setRunningNodeIds((prev: any) =>
        prev.filter((id: any) => id !== node.id)
      );
    }, 100);
  } catch (err) {}
}

export function mergeDeepOverwrite(
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

interface ColumnSchema {
  name: string;
  type: "string" | "number" | "boolean" | "object"; // 필요한 타입만 정의
}

interface WorkflowInputTable {
  tableKey: string;
  rows: Record<string, any>[];
}

/**
 * workflowInputs 검증 (포맷 + 컬럼 타입)
 * @param designTables 디자인 테이블 (컬럼 스키마)
 * @param inputs 실제 workflowInputs
 * @returns true: 유효, false: 포맷/타입 불일치
 */
// 컬럼 정의
export interface ColumnDesign {
  name: string;
  type: "string" | "number" | "boolean" | "object";
}

// 디자인 테이블: 여러 개 테이블 정의
export interface DesignTable {
  [tableKey: string]: ColumnDesign[];
}

// 입력 데이터셋: 각 테이블마다 행 배열
export interface InputDataset {
  [tableKey: string]: Record<string, any>[];
}
// 타입 안전하게 변환된 검증 함수
export function validationDataFormat(
  designedTables: DesignTable,
  actualTables: InputDataset
): boolean {
  for (const tableKey of Object.keys(actualTables)) {
    const rows = actualTables[tableKey];
    const design = designedTables[tableKey];

    // 디자인 정의가 없으면 실패
    if (!design) return false;

    for (const row of rows ?? []) {
      for (const col of design) {
        if (!(col.name in row)) return false;

        const value = row[col.name];
        switch (col.type) {
          case "string":
            if (typeof value !== "string") return false;
            break;
          case "number":
            if (typeof value !== "number") return false;
            break;
          case "boolean":
            if (typeof value !== "boolean") return false;
            break;
          case "object":
            if (
              typeof value !== "object" ||
              value === null ||
              Array.isArray(value)
            )
              return false;
            break;
          default:
            return false;
        }
      }
    }
  }
  return true;
}
