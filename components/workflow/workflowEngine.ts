import {
  getAction,
  registerBuiltInActions,
} from "@/components/workflow/actionRegistry";
import type { Connection, Edge, Node } from "reactflow";
import * as constants from "@/components/core/constants";
import * as actionRegistry from "@/components/workflow/actionRegistry";

registerBuiltInActions();

export type DBType = "postgres" | "mysql" | "mssql" | "oracle";

type TransactionMode = "SYSTEM" | "BUSINESS";

export interface TransactionContext {
  connectionId: string;
  dbType: DBType;
  txInstance: any; // 실제 DB 연결 또는 트랜잭션 객체
  mode: TransactionMode;
  isDistributed?: boolean;
}

// DB별 txInstance Map
export type TxInstancesMap = Map<string, any>;

// ---------------------------
// 워크플로우 실행
// ---------------------------
export async function executeWorkflow(
  workflow: any,
  setRunningNodeIds: any = null,
  txInstances: TxInstancesMap = new Map() // DB별 트랜잭션
) {
  const nodesList = workflow.nodes;
  const edgesList = workflow.edges;
  const edgeMap: Record<string, any[]> = {};

  edgesList.forEach((e: any) => {
    if (!e.source) return;
    if (!edgeMap[e.source]) edgeMap[e.source] = [];
    edgeMap[e.source]?.push(e);
  });

  const visitedNodes = new Set<string>();

  async function traverse(nodeId: string) {
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);

    const node = nodesList.find((n: any) => n.id === nodeId);
    if (!node) return;

    const txInstance = node.data.connectionId
      ? txInstances.get(node.data.connectionId)
      : undefined;

    if (setRunningNodeIds)
      setRunningNodeIds((prev: any) => [...(prev || []), nodeId]);
    await runWorkflowStep(node, workflow, txInstance);
    if (setRunningNodeIds)
      setRunningNodeIds((prev: any) =>
        (prev || []).filter((id: any) => id !== nodeId)
      );

    for (const edge of edgeMap[nodeId] || []) {
      if (!edge.data?.condition || Boolean(edge.data.condition))
        await traverse(edge.target);
    }
  }

  const startNode = nodesList.find(
    (n: any) => n.data.actionName === constants.workflowActions.START
  );
  if (!startNode) throw new Error("Start node not found");

  await traverse(startNode.id);
}

// ---------------------------
// 워크플로우 노드 실행 (트랜잭션 연동)
// ---------------------------
async function runWorkflowStep(
  node: Node<any>,
  workflowData: any,
  txInstance?: any
) {
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  // 액션에 txInstance 전달
  await action(node, workflowData, txInstance);
}

// ---------------------------
// 다음 노드 실행 (트랜잭션 전달)
// ---------------------------
export async function executeNextNode(
  workflowData: any,
  setRunningNodeIds: any = null,
  txInstance: any = null // 트랜잭션 객체
) {
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

  if (!node) throw new Error(constants.messages.WORKFLOW_NODE_NOT_FOUND);

  workflowData.currentNodeId = node.id;

  try {
    const runInputs = actionRegistry.interpolate(
      node.data.design.inputs || {},
      workflowData
    );
    node.data.run = { ...node.data.run, inputs: runInputs };

    setRunningNodeIds((prev: any) => [...prev, node.id]);
    await runWorkflowStep(node, workflowData, txInstance);

    setTimeout(() => {
      setRunningNodeIds((prev: any) =>
        prev.filter((id: any) => id !== node.id)
      );
    }, 100);
  } catch (err) {}
}

// ---------------------------
// 기타 유틸
// ---------------------------
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
      if (
        !target[key] ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        target[key] = {};
      }
      mergeDeepOverwrite(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ---------------------------
// 데이터 검증
// ---------------------------
interface ColumnSchema {
  name: string;
  type: "string" | "number" | "boolean" | "object";
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

    if (!actualRows) return false;
    if (!designedColumns) continue;

    for (const row of actualRows) {
      for (const column of designedColumns) {
        const value = row[column.name];
        if (value === undefined) return false;

        const valueType = typeof value;
        if (valueType !== column.type) return false;
      }
    }
  }

  return true;
}
