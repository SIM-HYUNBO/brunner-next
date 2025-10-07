`use strict`;

import * as constants from "@/components/core/constants";
import * as database from "../database/database";
import * as dynamicSql from "../dynamicSql";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as commonData from "@/components/core/commonData";
import { DBConnectionManager } from "@/pages/api/biz/workflow/dbConnectionManager";
import type { DBConnectionConfig, DBType } from "./dbConnectionManager";

import type { PoolClient } from "pg";
import type { PoolConnection } from "mysql2/promise";
import type * as mssqlType from "mssql";
import type * as oracleType from "oracledb";

type MssqlConnectionPool = {
  request: () => {
    input: (name: string, value: any) => any;
    query: (sql: string) => Promise<{ recordset: any[] }>;
  };
};

type DBConnection =
  | PoolClient
  | PoolConnection
  | InstanceType<typeof mssqlType.ConnectionPool>
  | oracleType.Connection;

const logger = require("./../../../../components/core/server/winston/logger");

export type WorkflowContext = Record<string, any> & {
  runWorkflow?: (workflow: any, workflowData: WorkflowContext) => Promise<any>;
  router?: any;
  input?: commonData.NodeDataTable[];
  output?: commonData.NodeDataTable[];
};

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  node: Node<any>,
  workflow: any,
  txContext: Map<string, TransactionContext>
) => Promise<{ error_code: number; error_message: any }>;

export const actionMap = new Map<string, ActionHandler>();

// -------------------- 액션 등록 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}

export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}

// 객체 경로로 값 가져오기
export function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
export function setByPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let target = obj;
  for (let i: number = 0; i < keys.length - 1; i++) {
    if (!target[String(keys[i])]) target[String(keys[i])] = {};
    target = target[String(keys[i])];
  }
  target[String(keys[keys.length - 1])] = value;
}

/* value (객체)의 모든 템플릿 {{}} 데이터(변수값)를 실제 값으로 치환 */
export function interpolate(value: any, ctx: any): any {
  return value;
}

// 조건 평가
export function evalCondition(cond: any, workflowData: any) {
  if (!cond) return true;
  const res = interpolate(cond, workflowData).trim().toLowerCase();
  return res !== "" && res !== "false" && res !== "0";
}

const nodeActionLogging = (node: Node<any>, stepInputs: WorkflowContext) => {
  console.log(
    `Execute Node [${node.id}] Inputs:`,
    JSON.stringify(node.data, null, 2)
  );
};

const preNodeCheck = (node: Node<any>, workflowData: any) => {
  node.data.status = constants.workflowRunStatus.running;

  if (!evalCondition(node.data.if, workflowData)) {
    return false; // 조건 불일치 → 실행하지 않음
  }
  // 파라미터 보간 처리
  node.data.run.inputs = interpolate(
    node.data.design.inputs || {},
    workflowData
  );
  nodeActionLogging(node, node.data.run.inputs);
  return true;
};

const postNodeCheck = (node: Node<any>, workflowData: any) => {
  node.data.status = constants.workflowRunStatus.idle;
};

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  // START
  registerAction(
    constants.workflowActions.START,
    async (node, workflowData, txContext) => {
      var result = { error_code: -1, error_message: "" };
      try {
        if (!node) {
          result.error_code = -1;
          result.error_message = "node is invalid.";
          return result;
        }
        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);

          result.error_code = -1;
          result.error_message = "node is invalid.";
        }

        // Node main action
        workflowData.data.run.system = {};
        workflowData.data.run.system.startTime = new Date();

        postNodeCheck(node, workflowData);
        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
      } catch (error) {
        result.error_code = -1;
        result.error_message = JSON.stringify(error);
        return result;
      }
      return result;
    }
  );

  // END
  registerAction(
    constants.workflowActions.END,
    async (node, workflowData, txContext) => {
      var result = { error_code: -1, error_message: "" };
      try {
        if (!node) {
          result.error_code = -1;
          result.error_message = "node is invalid.";
          return result;
        }

        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);

          result.error_code = -1;
          result.error_message = "node is invalid.";
          return result;
        }
        workflowData.data.run.system.endTime = new Date();
        workflowData.data.run.system.durationMs =
          new Date(workflowData.data.run.system.endTime).getTime() -
          new Date(workflowData.data.run.system.startTime).getTime();

        postNodeCheck(node, workflowData);

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (error) {
        result.error_code = -1;
        result.error_message = JSON.stringify(error);
        return result;
      }
    }
  );

  // CALL
  registerAction(
    constants.workflowActions.CALL,
    async (node, workflowData, txContext) => {
      var result = { error_code: -1, error_message: "" };

      if (!node) {
        result.error_code = -1;
        result.error_message = "node is invalid.";
        return result;
      }

      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        result.error_code = -1;
        result.error_message = "Node is invalid.";
        return result;
      }

      postNodeCheck(node, workflowData);
      result.error_code = 0;
      result.error_message = constants.messages.SUCCESS_FINISHED;
      return result;
    }
  );

  // SCRIPT

  // safe Api

  /*
    log(...) – 워커 내부 로그 저장
    alert(msg) – 메인 스레드 alert
    sleep(ms) – 비동기 지연
    getGlobalVar(path) / setGlobalVar(path, value) – 워크플로우 전역 변수(workflowData) 아래 패스로 경로 접근
    getVar(path) / setVar(path, value) – 해당 노드 변수(node) 아래 패스로 경로 접근
    now() – 현재 Date 객체
    timestamp() – 현재 timestamp (ms)
    random(min, max) – 난수 생성
    clone(obj) – 안전한 깊은 복사
    jsonParse(str) / jsonStringify(obj) – JSON 처리
    formatDate(date, fmt) – 날짜 포맷(간단 예시)
  */
  /*
  const userScript: string =
        node.data.design.scriptConents ||
        `
        // POST 요청 예제

        const body = {
          title: "sim",
          body: "hyunbo",
          age: 40
        }

        const response = await api.postJson(
          "https://jsonplaceholder.typicode.com/posts",
          body
        );
        api.setVar("data.run.output", response);
        `;

      const userScript = `
      SQL 실행 예제
      node.data.run.inputs에서 connectionId, query, params를 가져와서 사용

      const databaseId = "brunner"; // DB 연결 ID
      const query = `
      SELECT *
        FROM brunner.tb_cor_user_mst
       WHERE user_id = $1`;
      const params = ['fredric']; // 파라미터

      try {
        const result = await api.sql(databaseId, query, params);
        api.log("SQL 결과:", result);
        return result; // 노드 실행 결과 리턴한 값은 node.data.run.output에 자동 저장됨
      } catch (err) {
        api.log("SQL 실행 오류:", err.message);
        api.setVar("data.run.output", err);
        return err; // 노드 실행 결과 리턴한 값은 node.data.run.output에 자동 저장됨
      }
      `;
  */

  /* nodes에서 특정 노드 이름 ("Node 1")으로 찾기
  var targetNode = (api.getGlobalVar("nodes") || []).find(n => n.data.label === "Node 1");

  if (targetNode) {
    // outputs 배열 가져오기
    var sourceOutputs = targetNode.data.run.outputs || [];

    // user_name만 추출
    var userNames = sourceOutputs.map(o => o?.user_name).filter(Boolean); // null/undefined 제거

    if (userNames.length > 0) {
      // 현재 노드 outputs에 복사
      userNames.forEach((name, idx) => {
        api.setVar(`data.run.outputs.${idx}`, name);
      });

      // ✅ 이 부분이 핵심: 반드시 백틱(`)으로 감싸야 함
      api.log(`User names set to outputs: ${userNames.join(", ")}`);
    } else {
      api.log("No user_name found in Node 1 outputs", "warn");
    }
  } else {
    api.log("Node with label 'Node 1' not found", "warn");
  }
  */
  // SCRIPT
  registerAction(
    constants.workflowActions.SCRIPT,
    async (node: any, workflowData: any, txContext) => {
      var result = { error_code: -1, error_message: "" };

      const userScript = node.data.design.scriptContents || "";

      const timeoutMs: number = node.data.design.timeoutMs || 5000;

      // 유틸 함수들 타입 명시
      function getByPath(obj: Record<string, any>, path: string): any {
        return path
          .split(".")
          .reduce((o, k) => (o != null ? o[k] : undefined), obj);
      }

      function setByPath(
        obj: Record<string, any>,
        path: string,
        value: any
      ): void {
        const keys: string[] = path.split(".");
        let target: Record<string, any> = obj;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!target[String(keys[i])]) target[String(keys[i])] = {};
          target = target[String(keys[i])] as Record<string, any>;
        }
        target[String(keys[keys.length - 1])] = value;
      }

      const logs: string[] = [];

      const safeApi = {
        log: (message: any, level: "info" | "warn" | "error" = "info") => {
          if (typeof message === "object") message = JSON.stringify(message);
          logger.log(level, message);
        },
        info: (message: any) => safeApi.log(message, "info"),
        warn: (message: any) => safeApi.log(message, "warn"),
        error: (message: any) => safeApi.log(message, "error"),
        sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
        getGlobalVar: (path: string) => getByPath(workflowData, path),
        setGlobalVar: (path: string, value: any) =>
          setByPath(workflowData, path, value),
        getVar: (path: string) => getByPath(node, path),
        setVar: (path: string, value: any) => setByPath(node, path, value),
        now: (): Date => new Date(),
        timestamp: (): number => Date.now(),
        random: (min: number = 0, max: number = 1): number =>
          Math.random() * (max - min) + min,
        clone: (obj: any): any => JSON.parse(JSON.stringify(obj)),
        jsonParse: (str: string): any => JSON.parse(str),
        jsonStringify: (obj: any): string => JSON.stringify(obj),
        formatDate: (date: Date, fmt: string): string => date.toISOString(),
        postJson: async (url: string, body: any): Promise<any> => {
          const res = await fetch(url, {
            method: constants.httpMethod.POST,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          return await res.json();
        },
        sql: async (connectionId: string, sql: string, params?: any[]) => {
          let txContextEntry = getTxContextEntry(txContext, connectionId);

          if (!txContextEntry) {
            // UUID 형식 체크
            const isUUID =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                connectionId
              );

            if (!isUUID) {
              // 이름으로 조회
              txContextEntry = Array.from(txContext.values()).find(
                (ctx) => ctx.connectionName === connectionId
              );
            }
          }

          const tx = txContextEntry?.dbConnection;
          if (!tx)
            throw new Error(
              `${constants.messages.NO_DATA_FOUND}:${connectionId}`
            );

          const dbType = txContextEntry?.dbType;

          switch (dbType) {
            case constants.dbType.mysql:
              const [result] = await (tx as PoolConnection).query(
                sql,
                params || []
              );
              return result;

            case constants.dbType.postgres:
              const resultPg = await (tx as PoolClient).query(
                sql,
                params || []
              );
              return resultPg.rows;

            case constants.dbType.mssql:
              const request = (tx as MssqlConnectionPool).request();
              if (params)
                params.forEach((p, i) => request.input(`param${i + 1}`, p));
              const resultMs = await request.query(sql);
              return resultMs.recordset;

            case constants.dbType.oracle:
              const resultOra = await (tx as oracleType.Connection).execute(
                sql,
                params || [],
                {
                  outFormat: (require("oracledb") as any).OUT_FORMAT_OBJECT,
                }
              );
              return resultOra.rows;

            default:
              throw new Error(
                `${constants.messages.NOT_SUPPORTED_DB_TYPE}:${dbType}`
              );
          }
        },
      };

      function getTxContextEntry(
        txContext: Map<string, TransactionContext>,
        connectionIdOrName: string
      ): TransactionContext | undefined {
        // UUID 형식 체크
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isId = uuidRegex.test(connectionIdOrName);

        // 1️⃣ id 기준 조회
        if (isId && txContext.has(connectionIdOrName)) {
          return txContext.get(connectionIdOrName);
        }

        // 2️⃣ id로 못 찾으면 이름 기준 조회
        for (const ctx of txContext.values()) {
          if (ctx.connectionName === connectionIdOrName) {
            return ctx;
          }
        }

        // 3️⃣ 못 찾으면 undefined
        return undefined;
      }

      var res = null;

      try {
        const AsyncFunction = Object.getPrototypeOf(async function () {})
          .constructor as any;

        // sourceURL 추가
        const fn = new AsyncFunction(
          "actionData",
          "workflowData",
          "api",
          userScript + "\n//# sourceURL=userScript.js"
        );

        res = await Promise.race([
          fn(node.data || {}, workflowData.data || {}, safeApi),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), timeoutMs)
          ),
        ]);

        logs.forEach((line: string) => console.log("[SCRIPT]", line));

        // 스크립트 결과는 별도 저장 안함
        postNodeCheck(node, workflowData);

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (err: any) {
        result = { error_code: -1, error_message: err };

        // stack에서 userScript 줄 정보 찾기
        const stackLines = err.stack?.split("\n") || [];
        const userScriptLine = stackLines.find((line: string) =>
          line.includes("userScript.js")
        );

        const errorLocation = userScriptLine
          ? `(at ${userScriptLine.trim()})`
          : "";
        console.error(`[SCRIPT ERROR] ${err.message} ${errorLocation}`);

        // outputs에도 기록
        node.data.run.outputs = [
          err.message + (errorLocation ? ` ${errorLocation}` : ""),
        ];
        return result;
      }
    }
  );

  // SQL
  registerAction(
    constants.workflowActions.SQL,
    async (node, workflowData, txContext) => {
      var result = { error_code: -1, error_message: "" };

      if (!node) {
        result.error_code = -1;
        result.error_message = "node is invalid.";
        return result;
      }

      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);

        result.error_code = -1;
        result.error_message = "node is invalid.";
      }

      const { dbConnectionId, sqlStmt, sqlParams } = node.data?.design || {};

      if (!dbConnectionId)
        throw new Error(
          `${constants.messages.REQUIRED_FIELD}:node.data.design.connetionId`
        );
      if (!sqlStmt)
        throw new Error(
          `${constants.messages.REQUIRED_FIELD}:node.data.design.sqlStmt`
        );

      const dbManager = DBConnectionManager.getInstance();

      const dbConfig = await dbManager.get(dbConnectionId);
      if (!dbConfig)
        throw new Error(
          `${constants.messages.NO_DATA_FOUND}: ${dbConnectionId}`
        );

      const dbType = dbConfig.type;

      let connection: any = null;
      let rows: any = null;

      try {
        // ✅ 연결 가져오기
        connection = await dbManager.getConnection(dbConnectionId);

        switch (connection.type) {
          case constants.dbType.mysql: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.mysql
            );
            const [result] = await connection.dbConnection.query(sql, params);
            rows = result;
            break;
          }

          case constants.dbType.postgres: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.postgres
            );
            const result = await connection.dbConnection.query(sql, params);
            rows = result.rows;
            break;
          }

          case constants.dbType.mssql: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.mssql
            );
            const request = connection.dbConnection.request();
            if (Array.isArray(params)) {
              params.forEach((p) => {
                request.input(p.name, p.value);
              });
            }
            const result = await request.query(sql);
            rows = result.recordset;
            break;
          }

          case constants.dbType.oracle: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.oracle
            );
            const binds: Record<string, any> = {};
            sqlParams.forEach((p: any) => (binds[p.name] = p.value));

            const result = await connection.dbConnection.execute(sql, binds, {
              outFormat: (require("oracledb") as any).OUT_FORMAT_OBJECT,
            });
            rows = result.rows;
            break;
          }
          default:
            throw new Error(
              `${constants.messages.NOT_SUPPORTED_DB_TYPE}: ${dbType}`
            );
        }

        // ✅ 결과 저장
        node.data.run.outputs = rows;
        // workflowData.data.run.outputs = rows;

        console.log(
          `[SQL_NODE] ${connection.type.toUpperCase()} 쿼리 실행 완료`
        );

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (err: any) {
        console.error(`[SQL_NODE ERROR][${dbType}]`, err);
        throw err;
      } finally {
        // ✅ 커넥션 반환
        if (connection.dbConnection) {
          try {
            if (
              dbType === constants.dbType.mysql ||
              dbType === constants.dbType.postgres
            )
              connection.dbConnection.release();
            else if (dbType === constants.dbType.oracle)
              await connection.dbConnection.close();
            // mssql은 풀로 관리되므로 별도 close 없음
          } catch (closeErr) {
            console.warn("Connection close error:", closeErr);
          }
        }
        postNodeCheck(node, workflowData);
      }
    }
  );
}

function convertNamedParams(sqlStmt: string, sqlParams: any[], dbType: string) {
  if (!sqlParams || sqlParams.length === 0) {
    return { sql: sqlStmt, params: [] };
  }

  let sql = sqlStmt;
  let params: any[] = [];

  switch (dbType) {
    case constants.dbType.postgres: {
      // @name → $1, $2, ...
      sqlParams.forEach((p, i) => {
        const pattern = new RegExp(`@${p.name}\\b`, "g");
        sql = sql.replace(pattern, `$${i + 1}`);
        params.push(p.value);
      });
      break;
    }

    case constants.dbType.mysql: {
      // @name → ?
      sqlParams.forEach((p) => {
        const pattern = new RegExp(`@${p.name}\\b`, "g");
        sql = sql.replace(pattern, `?`);
        params.push(p.value);
      });
      break;
    }

    case constants.dbType.mssql: {
      // @name 그대로 사용 가능 (MSSQL은 기본적으로 지원)
      params = sqlParams;
      break;
    }

    case constants.dbType.oracle: {
      // :name 형태로 치환
      sqlParams.forEach((p) => {
        const pattern = new RegExp(`@${p.name}\\b`, "g");
        sql = sql.replace(pattern, `:${p.name}`);
        params.push(p.value);
      });
      break;
    }
  }

  return { sql, params };
}

// ---------------------------
// 1️⃣ 트랜잭션 컨텍스트
// ---------------------------
export class TransactionContext {
  connectionId: string;
  connectionName: string;
  dbType: DBType;
  dbConnection: DBConnection;
  mode: "SYSTEM" | "BUSINESS";
  isDistributed: boolean = false;

  constructor(
    connectionId: string,
    connectionName: string,
    dbType: DBType,
    mode: "SYSTEM" | "BUSINESS"
  ) {
    this.connectionId = connectionId;
    this.connectionName = connectionName;
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

  async start(workflow: any, dbConnections?: Map<string, any>) {
    const dbManager = DBConnectionManager.getInstance();

    // ① workflow.dbConnections 있으면 사용, 없으면 dbManager.list()에서 풀 정보 가져오기
    const connections: Record<
      string,
      { dbType: DBType; connectionName: string }
    > =
      workflow.dbConnections && Object.keys(workflow.dbConnections).length > 0
        ? Object.fromEntries(
            Object.entries(workflow.dbConnections).map(([id, type]) => [
              id,
              { dbType: type as DBType, connectionName: "" }, // 타입 단언
            ])
          )
        : Object.fromEntries(
            dbManager.list().map((conn) => [
              conn.id,
              { dbType: conn.type as DBType, connectionName: conn.name }, // 타입 단언
            ])
          );

    for (const [connectionId, info] of Object.entries(connections)) {
      const dbType = info.dbType;
      let connectionName = info.connectionName || "";
      let connection;

      // ② 이미 주어진 connectionId가 있으면 사용
      if (dbConnections?.has(connectionId)) {
        connection = dbConnections.get(connectionId);

        // pools에서 name 가져오기
        const poolInfo = dbManager.list().find((c) => c.id === connectionId);
        if (poolInfo) connectionName = poolInfo.name;

        this.txContexts.set(connectionId, {
          connectionId,
          connectionName,
          dbType,
          dbConnection: connection,
          mode: "BUSINESS",
          isDistributed: false,
        });
        continue;
      }

      // ③ 새 연결 생성
      const pool = dbManager.getPool(connectionId);

      switch (dbType) {
        case constants.dbType.postgres:
          connection = await pool.connect();
          await connection.query("BEGIN");
          break;

        case constants.dbType.mysql:
          connection = await pool.getConnection();
          await connection.beginTransaction();
          break;

        case constants.dbType.mssql:
          connection = pool; // MSSQL은 풀 그대로 사용
          await connection.request().query("BEGIN TRANSACTION");
          break;

        case constants.dbType.oracle:
          connection = await pool.getConnection();
          await connection.execute("BEGIN");
          break;

        default:
          throw new Error(`Unsupported DBType: ${dbType}`);
      }

      // pools에서 name 가져오기
      const poolInfo = dbManager.list().find((c) => c.id === connectionId);
      if (poolInfo) connectionName = poolInfo.name;

      this.txContexts.set(connectionId, {
        connectionId,
        connectionName,
        dbType,
        dbConnection: connection,
        mode: "BUSINESS",
        isDistributed: false,
      });
    }
  }

  async commit() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.dbConnection;
      if (!tx) continue;

      switch (ctx.dbType) {
        case constants.dbType.postgres:
          await tx.query("COMMIT");
          break;
        case constants.dbType.mysql:
          await tx.commit();
          break;
        case constants.dbType.mssql:
          await tx.request().query("COMMIT TRANSACTION");
          break;
        case constants.dbType.oracle:
          await tx.execute("COMMIT");
          break;
      }

      tx.release?.();
    }
  }

  async rollback() {
    for (const ctx of this.txContexts.values()) {
      const tx = ctx.dbConnection;
      if (!tx) continue;

      switch (ctx.dbType) {
        case constants.dbType.postgres:
          await tx.query("ROLLBACK");
          break;
        case constants.dbType.mysql:
          await tx.rollback();
          break;
        case constants.dbType.mssql:
          await tx.request().query("ROLLBACK TRANSACTION");
          break;
        case constants.dbType.oracle:
          await tx.execute("ROLLBACK");
          break;
      }

      tx.release?.();
    }
  }

  get(connectionId: string) {
    return this.txContexts.get(connectionId)?.dbConnection;
  }
}

export function initializeWorkflowEngine() {
  registerBuiltInActions(); // 여기서 actionMap을 채움
}

// ---------------------------
// 4️⃣ 워크플로우 실행
// ---------------------------
export async function executeWorkflow(
  workflow: any,
  txContext: Map<string, TransactionContext> = new Map()
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

  async function traverse(
    nodeId: string,
    txContext: Map<string, TransactionContext> = new Map()
  ) {
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);

    const node = nodesList.find((n: any) => n.id === nodeId);
    if (!node) return;

    await runWorkflowStep(node, workflow, txContext);

    for (const edge of edgeMap[nodeId] || []) {
      if (!edge.data?.condition || Boolean(edge.data.condition)) {
        await traverse(edge.target, txContext);
      }
    }
  }

  const startNode = nodesList.find(
    (n: any) => n.data.actionName === constants.workflowActions.START
  );
  if (!startNode) throw new Error("Start node not found");

  await traverse(startNode.id, txContext);
}

// ---------------------------
// 5️⃣ 노드 단위 실행
// ---------------------------
export async function runWorkflowStep(
  node: Node<any>,
  workflowData: any,
  txContext: Map<string, TransactionContext> = new Map()
) {
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  return await action(node, workflowData, txContext ?? undefined);
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

  var upsert_TB_COR_WORKFLOW_MST_01: any = null;
  if (select_TB_COR_WORKFLOW_MST.rowCount > 0) {
    // update
    sql = await dynamicSql.getSQL00(`update_TB_COR_WORKFLOW_MST`, 1);

    upsert_TB_COR_WORKFLOW_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
      workflowData,
      userId,
    ]);
  } else {
    // insert
    sql = await dynamicSql.getSQL00(`insert_TB_COR_WORKFLOW_MST`, 1);

    upsert_TB_COR_WORKFLOW_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
      workflowData,
      userId,
    ]);
  }

  if (upsert_TB_COR_WORKFLOW_MST_01.rowCount == 1) {
    result.error_code = 0;
    result.error_message = constants.messages.SUCCESS_FINISHED;
  } else {
    result.error_code = -1;
    result.error_message = upsert_TB_COR_WORKFLOW_MST_01.message;
  }

  logger.info(
    `\nRESULT:rowCount=\n${upsert_TB_COR_WORKFLOW_MST_01.rowCount}\n`
  );

  return result;
}

export async function deleteWorkflow(
  systemCode: string,
  userId: string,
  workflowId: string
) {
  var result = { error_code: -1, error_message: "" };

  var sql = await dynamicSql.getSQL00(`select_TB_COR_WORKFLOW_MST`, 1);
  var select_TB_COR_WORKFLOW_MST: any = await database.executeSQL(sql, [
    systemCode,
    workflowId,
  ]);

  var delete_TB_COR_WORKFLOW_MST_01: any = null;
  if (select_TB_COR_WORKFLOW_MST.rowCount <= 0) {
    result.error_code = -1;
    result.error_message = constants.messages.NO_DATA_FOUND;
  } else {
    // delete
    sql = await dynamicSql.getSQL00(`delete_TB_COR_WORKFLOW_MST`, 1);

    delete_TB_COR_WORKFLOW_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
    ]);

    if (delete_TB_COR_WORKFLOW_MST_01.rowCount == 1) {
      result.error_code = 0;
      result.error_message = constants.messages.SUCCESS_FINISHED;
    } else {
      result.error_code = -1;
      result.error_message = delete_TB_COR_WORKFLOW_MST_01.message;
    }
    logger.info(
      `\nRESULT:rowCount=\n${delete_TB_COR_WORKFLOW_MST_01.rowCount}\n`
    );
  }

  return result;
}

export async function getWorkflowList(systemCode: string, userId: string) {
  try {
    // 워크플로우 목록 조회 쿼리 (DB 구조에 맞게 수정 가능)
    const sql = await dynamicSql.getSQL00(`select_TB_COR_WORKFLOW_MST`, 2);

    var select_TB_COR_WORKFLOW_MST: any = await database.executeSQL(sql, [
      systemCode,
    ]);

    return {
      error_code: 0,
      list: select_TB_COR_WORKFLOW_MST, // [{id, workflow_data}, ...]
    };
  } catch (err: any) {
    console.error("getWorkflowList 오류:", err);
    return {
      error_code: -1,
      error_message: String(err.message || err),
      list: [],
    };
  }
}

export async function getWorkflowById(systemCode: string, workflowId: string) {
  try {
    // 1️⃣ SQL 조회
    const sql = await dynamicSql.getSQL00("select_TB_COR_WORKFLOW_MST", 1);
    const dbResult: any = await database.executeSQL(sql, [
      systemCode,
      workflowId,
    ]);

    // 2️⃣ 조회 결과 확인
    var result = { error_code: -1, error_message: "", workflow_data: {} };
    if (!dbResult || dbResult.rowCount === 0) {
      return {
        error_code: -1,
        error_message: `${constants.messages.NO_DATA_FOUND}`,
        workflowData: null,
      };
    } else {
      result.error_code = 0;
      result.error_message = constants.messages.SUCCESS_FINISHED;
      result.workflow_data = dbResult.rows[0].workflow_data;
    }

    // 3️⃣ 워크플로우 데이터 반환
    return result;
  } catch (err: any) {
    return null;
  }
}

await initializeWorkflowEngine();
