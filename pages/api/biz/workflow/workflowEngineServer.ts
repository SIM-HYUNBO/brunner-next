`use strict`;

import * as database from "../database/database";
import * as dynamicSql from "../dynamicSql";
import { getAction } from "@/components/workflow/actionRegistry";
import { DBConnectionManager } from "./dbConnectionManager";
import type { Node } from "reactflow";
import type { DBType } from "./dbConnectionManager";

const logger = require("./../../../../components/core/server/winston/logger");

// ---------------------------
// 1️⃣ 트랜잭션 컨텍스트
// ---------------------------
export class TransactionContext {
  connectionId: string;
  dbType: DBType;
  txInstance: any;
  mode: "SYSTEM" | "BUSINESS";
  isDistributed: boolean = false;

  constructor(
    connectionId: string,
    dbType: DBType,
    mode: "SYSTEM" | "BUSINESS"
  ) {
    this.connectionId = connectionId;
    this.dbType = dbType;
    this.mode = mode;
  }
}

// ---------------------------
// 2️⃣ 워크플로우 인스턴스
// ---------------------------
export class WorkflowInstance {
  id: string;
  txContexts: Map<string, TransactionContext> = new Map();

  constructor(id: string) {
    this.id = id;
  }

  addTransactionContext(txContext: TransactionContext) {
    this.txContexts.set(txContext.connectionId, txContext);
  }

  getTransactionContext(connectionId: string) {
    return this.txContexts.get(connectionId);
  }
}

// ---------------------------
// 3️⃣ 트랜잭션 노드
// ---------------------------
export class TransactionNode {
  txContexts: Map<string, TransactionContext> = new Map();

  async start(workflow: any, txInstances?: Map<string, any>) {
    for (const [connectionId, dbType] of Object.entries(
      workflow.connections || {}
    )) {
      if (txInstances?.has(connectionId)) {
        this.txContexts.set(connectionId, {
          connectionId,
          dbType: dbType as DBType,
          txInstance: txInstances.get(connectionId),
          mode: "BUSINESS",
          isDistributed: false,
        });
        continue;
      }

      const pool = DBConnectionManager.getInstance().getPool(connectionId);
      let connection;

      switch (dbType) {
        case "postgres":
          connection = await pool.connect();
          await connection.query("BEGIN");
          break;
        case "mysql":
          connection = await pool.getConnection();
          await connection.beginTransaction();
          break;
        default:
          throw new Error(`Unsupported DBType: ${dbType}`);
      }

      this.txContexts.set(connectionId, {
        connectionId,
        dbType,
        txInstance: connection,
        mode: "BUSINESS",
        isDistributed: false,
      });
    }
  }

  async commit() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.txInstance;
      if (!tx) continue;
      if (ctx.dbType === "postgres") await tx.query("COMMIT");
      else if (ctx.dbType === "mysql") await tx.commit();
      tx.release?.();
    }
  }

  async rollback() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.txInstance;
      if (!tx) continue;
      if (ctx.dbType === "postgres") await tx.query("ROLLBACK");
      else if (ctx.dbType === "mysql") await tx.rollback();
      tx.release?.();
    }
  }

  get(connectionId: string) {
    return this.txContexts.get(connectionId)?.txInstance;
  }
}

// ---------------------------
// 4️⃣ 워크플로우 실행
// ---------------------------
export async function executeWorkflow(
  workflow: any,
  txInstances: Map<string, any> = new Map()
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

    await runWorkflowStep(node, workflow, txInstance);

    for (const edge of edgeMap[nodeId] || []) {
      if (!edge.data?.condition || Boolean(edge.data.condition)) {
        await traverse(edge.target);
      }
    }
  }

  const startNode = nodesList.find((n: any) => n.data.actionName === "START");
  if (!startNode) throw new Error("Start node not found");

  await traverse(startNode.id);
}

// ---------------------------
// 5️⃣ 노드 단위 실행
// ---------------------------
export async function runWorkflowStep(
  node: Node<any>,
  workflowData: any,
  txInstance?: any
) {
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  await action(node, workflowData, txInstance ?? null);
}

export async function saveWorkflow(
  systemCode: string,
  userId: string,
  workflowId: string,
  workflowData: any
) {
  var result = { error_code: -1, error_message: "" };

  var sql = await dynamicSql.getSQL00(`select_TB_COR_WORKFLOW_MST`, 1);
  var select_TB_COR_WORKFLOW_MST: any = await database.executeSQL(sql, [
    systemCode,
    workflowId,
  ]);

  var upsert_TB_COR_USER_MST_01: any = null;
  if (select_TB_COR_WORKFLOW_MST.rowCount > 0) {
    // update
    sql = await dynamicSql.getSQL00(`update_TB_COR_WORKFLOW_MST`, 1);

    upsert_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
      workflowData,
      userId,
    ]);
  } else {
    // insert
    sql = await dynamicSql.getSQL00(`insert_TB_COR_WORKFLOW_MST`, 1);

    upsert_TB_COR_USER_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
      workflowData,
      userId,
    ]);
  }

  if (upsert_TB_COR_USER_MST_01.rowCount == 1) {
    result.error_code = 0;
    result.error_message = "";
  } else {
    result.error_code = -1;
    result.error_message = upsert_TB_COR_USER_MST_01.message;
  }

  logger.info(`\nRESULT:rowCount=\n${upsert_TB_COR_USER_MST_01.rowCount}\n`);

  return result;
}
