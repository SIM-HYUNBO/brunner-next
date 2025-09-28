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

  // 워크 플로우 입력 데이터 검증
  if (
    !validationJsonDataset(
      workflow.data.design.inputs,
      workflow.data.run.inputs
    )
  ) {
    throw new Error(constants.messages.WORKFLOW_INVALID_DATA_STRUCTURE);
  }

  const startNode = nodesList.find(
    (n) => n.data.actionName === constants.workflowActions.START
  );

  if (!startNode) {
    throw new Error(constants.messages.WORKFLOW_STARTNODE_NOT_FOUND);
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
    let result: Promise<any> | null = null;

    if (shouldRun && setRunningNodeIds) {
      setRunningNodeIds((prev: any) => {
        [...prev, nodeId];
      });

      result = await runWorkflowStep(node, workflow);

      setRunningNodeIds((prev: any) => {
        prev.filter((id: any) => id !== nodeId);
      });
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
  if (node.data.actionName === constants.workflowActions.START) {
    node.data.run.inputs = JSON.parse(
      JSON.stringify(workflowData.data.run.inputs)
    );
  }

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

export type ColumnDesign = {
  name: string;
  type: "string" | "number" | "boolean" | "object";
};

type DesignColumn = { name: string; type: string };
export type DesignedDataset = Record<string, DesignColumn[]>;
type ActualDataset = Record<string, Record<string, any>[]>;

export function validationJsonDataset(
  designedTables: DesignedDataset,
  actualTables: ActualDataset
): boolean {
  for (const tableName in designedTables) {
    const designedColumns = designedTables[tableName];
    const actualRows = actualTables[tableName];

    // 테이블 존재 여부
    if (!actualRows) return false;
    if (!designedColumns) continue; // 안전하게 건너뜀

    // 각 행 검증
    for (const row of actualRows) {
      for (const column of designedColumns) {
        const value = row[column.name];

        // 컬럼 존재 여부
        if (value === undefined) return false;

        // 타입 검증
        const valueType = typeof value;
        if (valueType !== column.type) return false;
      }
    }
  }

  return true;
}
