// pages/api/biz/workflow/transactionManager.ts
import { DBConnectionManager } from "./dbConnectionManager";
import { executeWorkflow } from "@/components/workflow/workflowEngine"; // 실제 워크플로우 실행 함수
import type { TxInstancesMap } from "@/components/workflow/workflowEngine";

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
  txContexts: Map<string, TransactionContext> = new Map();

  // 트랜잭션 시작 (DB별)
  async start(workflow: any, txInstances?: TxInstancesMap) {
    for (const [connectionId, dbType] of Object.entries(workflow.connections)) {
      if (txInstances?.has(connectionId)) {
        const dbType =
          DBConnectionManager.getInstance().getDBType(connectionId);

        // 이미 존재하면 재사용
        this.txContexts.set(connectionId, {
          connectionId,
          dbType,
          txInstance: txInstances.get(connectionId),
          mode: "BUSINESS",
          isDistributed: false,
        });
        continue;
      }

      const pool = DBConnectionManager.getInstance().getPool(connectionId);
      let connection;

      if (dbType === "postgres") {
        connection = await pool.connect();
        await connection.query("BEGIN");
      } else if (dbType === "mysql") {
        connection = await pool.getConnection();
        await connection.beginTransaction();
      } else if (dbType === "mssql") {
        connection = await pool.request();
        await connection.beginTransaction();
      } else if (dbType === "oracle") {
        connection = await pool.getConnection();
        await connection.execute("BEGIN");
      } else {
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

  get(connectionId: string) {
    return this.txContexts.get(connectionId)?.txInstance;
  }

  // 커밋
  async commit() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.txInstance;
      try {
        if (ctx.dbType === "postgres") await tx.query("COMMIT");
        else if (ctx.dbType === "mysql") await tx.commit();
        else if (ctx.dbType === "mssql") await tx.commit();
        else if (ctx.dbType === "oracle") await tx.execute("COMMIT");
      } catch (e) {
        console.error("커밋 실패:", e);
      } finally {
        tx.release?.();
      }
    }
  }

  // 롤백
  async rollback() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.txInstance;
      try {
        if (ctx.dbType === "postgres") await tx.query("ROLLBACK");
        else if (ctx.dbType === "mysql") await tx.rollback();
        else if (ctx.dbType === "mssql") await tx.rollback();
        else if (ctx.dbType === "oracle") await tx.execute("ROLLBACK");
      } catch (e) {
        console.error("롤백 실패:", e);
      } finally {
        tx.release?.();
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
