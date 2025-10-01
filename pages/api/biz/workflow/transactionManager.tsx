// pages/api/biz/workflow/transactionManager.ts
import { DBConnectionManager } from "./dbConnectionManager";
import { executeWorkflow } from "@/components/workflow/workflowEngine"; // 실제 워크플로우 실행 함수
import type { TxInstancesMap } from "@/components/workflow/workflowEngine";
import { DbType } from "oracledb";
// ---------------------------
// 1️⃣ 트랜잭션 컨텍스트
// ---------------------------
export type DBType = "postgres" | "mysql" | "mssql" | "oracle";
export type TransactionMode = "SYSTEM" | "BUSINESS";

export class TransactionContext {
  connectionId: string;
  dbType: DBType;
  txInstance: any; // DB별 연결/트랜잭션 객체
  mode: TransactionMode;
  isDistributed: boolean = false;

  constructor(connectionId: string, dbType: DBType, mode: TransactionMode) {
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

  getTransactionContext(connectionId: string): TransactionContext | undefined {
    return this.txContexts.get(connectionId);
  }
}

// ---------------------------
// 3️⃣ START / END 노드 트랜잭션 처리
// ---------------------------
export class TransactionNode {
  async start(
    workflow: WorkflowInstance,
    connectionId: string,
    dbType: DBType,
    mode: TransactionMode
  ) {
    const pool = DBConnectionManager.getInstance().getPool(connectionId);
    let connection;

    // DB별 연결/트랜잭션 시작
    if (dbType === "postgres") {
      connection = await pool.connect(); // client
      await connection.query("BEGIN");
    } else if (dbType === "mysql") {
      connection = await pool.getConnection(); // conn
      await connection.beginTransaction();
    } else {
      throw new Error(`Unsupported DBType: ${dbType}`);
    }

    const txContext = new TransactionContext(connectionId, dbType, mode);
    txContext.txInstance = connection;
    workflow.addTransactionContext(txContext);
  }

  async end(workflow: WorkflowInstance, success: boolean) {
    for (const txContext of workflow.txContexts.values()) {
      const tx = txContext.txInstance;
      const dbType = txContext.dbType;

      try {
        if (dbType === "postgres") {
          if (success) await tx.query("COMMIT");
          else await tx.query("ROLLBACK");
          tx.release();
        } else if (dbType === "mysql") {
          if (success) await tx.commit();
          else await tx.rollback();
          tx.release();
        }
      } catch (e) {
        console.error("트랜잭션 종료 중 오류:", e);
      }
    }
  }
}

// ---------------------------
// 4️⃣ 하위 워크플로우 호출
// ---------------------------

export async function executeSubWorkflow(
  parentTxInstances: TxInstancesMap,
  subWorkflow: any,
  setRunningNodeIds: any = null
) {
  const subTxInstances: TxInstancesMap = new Map(parentTxInstances);

  // 하위 워크플로우에서 DB를 사용하는 모든 노드 확인
  const dbNodeIds = subWorkflow.nodes
    .filter((n: any) => n.data.connectionId)
    .map((n: any) => n.data.connectionId);

  for (const connectionId of dbNodeIds) {
    // 이미 부모 txInstances에 있는 DB면 재사용
    if (subTxInstances.has(connectionId)) continue;

    // DB 타입 조회
    const dbType = DBConnectionManager.getInstance().getDBType(connectionId);

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
      case "mssql":
        connection = await pool.connect();
        await connection.beginTransaction();
        break;
      case "oracle":
        connection = await pool.getConnection();
        await connection.execute("BEGIN");
        break;
      default:
        throw new Error(`Unsupported DBType: ${dbType}`);
    }

    subTxInstances.set(connectionId, connection);
  }

  // 하위 워크플로우 실행
  await executeWorkflow(subWorkflow, setRunningNodeIds, subTxInstances);
}

// ---------------------------
// 5️⃣ 노드 단위 비즈니스 트랜잭션 실행
// ---------------------------
export async function executeNode(node: any, workflow: WorkflowInstance) {
  const txContext = workflow.getTransactionContext(node.connectionId);

  if (!txContext) throw new Error("트랜잭션 컨텍스트가 없습니다.");

  if (txContext.mode === "BUSINESS") {
    const pool = DBConnectionManager.getInstance().getPool(node.connectionId);
    let connection;

    if (txContext.dbType === "postgres") {
      connection = await pool.connect();
      await connection.query("BEGIN");
    } else if (txContext.dbType === "mysql") {
      connection = await pool.getConnection();
      await connection.beginTransaction();
    } else {
      throw new Error(`Unsupported DBType: ${txContext.dbType}`);
    }

    try {
      await node.execute(connection);
      if (txContext.dbType === "postgres") await connection.query("COMMIT");
      else if (txContext.dbType === "mysql") await connection.commit();
    } catch (e) {
      if (txContext.dbType === "postgres") await connection.query("ROLLBACK");
      else if (txContext.dbType === "mysql") await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  } else {
    await node.execute(txContext.txInstance); // 시스템 트랜잭션 공유
  }
}
