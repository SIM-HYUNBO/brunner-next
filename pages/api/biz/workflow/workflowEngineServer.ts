`use strict`;

import * as constants from "@/components/core/constants";
import * as database from "../database/database";
import * as dynamicSql from "../dynamicSql";
import type { Connection, Edge, Node, NodeChange, EdgeChange } from "reactflow";
import * as commonData from "@/components/core/commonData";
import * as commonFunctions from "@/components/core/commonFunctions";
import { DBConnectionManager } from "@/pages/api/biz/workflow/dbConnectionManager";
import type {
  DBConnectionConfig,
  DBConnectionPool,
  DBType,
} from "./dbConnectionManager";

import type { PoolClient } from "pg";
import type { PoolConnection } from "mysql2/promise";
import type * as mssqlType from "mssql";
import type * as oracleType from "oracledb";
import https from "https";
import axios from "axios";
import * as mailSender from "@/components/core/server/mailSender";

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
  input?: commonData.DataTable[];
  output?: commonData.DataTable[];
};

// -------------------- 액션 타입 --------------------
export type ActionHandler = (
  systemCode: string,
  node: Node<any>,
  workflow: any,
  txContext: Map<string, TransactionContext>,
  safeApi: any
) => Promise<{ error_code: number; error_message: any }>;

export const actionMap = new Map<string, ActionHandler>();

// -------------------- 액션 등록 --------------------
export function registerAction(name: string, handler: ActionHandler): void {
  actionMap.set(name, handler);
}

export function getAction(name: string): ActionHandler | undefined {
  return actionMap.get(name);
}

function interpolate(value: any, ctx: any): any {
  if (typeof value === "string") {
    return value.replace(/\$\{(.+?)\}|\{\{(.+?)\}\}/g, (_, g1, g2) => {
      const path = g1 || g2;
      const result = commonFunctions.getByPath(ctx, path);
      return result !== undefined ? result : constants.General.EmptyString;
    });
  }
  return value;
}

// 조건 평가
export function evalCondition(cond: any, workflowData: any) {
  if (!cond) return true;
  const res = interpolate(cond, workflowData).trim().toLowerCase();
  return (
    res !== constants.General.EmptyString && res !== "false" && res !== "0"
  );
}

const nodeActionLogging = (node: Node<any>, stepInputs: WorkflowContext) => {
  logger.info(`Execute Node [${node.id}:${node.data.label}]`);
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
  // 상태 초기화
  node.data.status = constants.workflowRunStatus.idle;

  // workflowData.nodes에서 node.id에 해당하는 노드 찾기
  const index = workflowData.nodes.findIndex((n: any) => n.id === node.id);

  if (index >= 0) {
    // 기존 노드 업데이트 (node.data만 반영)
    workflowData.nodes[index] = {
      ...workflowData.nodes[index],
      data: { ...node.data },
    };
  } else {
    // 없으면 새로 추가
    workflowData.nodes.push({ ...node });
  }
};

export function createSafeApi(workflowData: any, txContext: any) {
  const safeApi = {
    clone: (obj: any): any => JSON.parse(JSON.stringify(obj)),
    error: (message: any) => safeApi.log(message, "error"),
    formatDate: (date: Date, fmt: string): string => date.toISOString(),
    getVar: (path: string) => commonFunctions.getByPath(workflowData, path),
    info: (message: any) => safeApi.log(message, "info"),
    log: (message: any, level: "info" | "warn" | "error" = "info") => {
      if (typeof message === "object") message = JSON.stringify(message);
      logger.log(level, message);
    },
    postJson: async (url: string, body: any): Promise<any> => {
      // https 인증서 오류 무시
      const agent = new https.Agent({ rejectUnauthorized: false });
      const res = await axios.post(url, body, {
        httpsAgent: agent,
        headers: { "Content-Type": "application/json" },
      });
      return await res.data;
    },
    getJson: async (url: string, params: any): Promise<any> => {
      // https 인증서 오류 무시
      const agent = new https.Agent({ rejectUnauthorized: false });
      const config = {
        headers: { "Content-Type": "application/json" },
        httpsAgent: agent,
        params: params,
      };
      const res = await axios.get(url, config);
      return await res.data;
    },
    random: (min: number = 0, max: number = 1): number =>
      Math.random() * (max - min) + min,
    sendMail: async (transporterOption: any, mailOption: any): Promise<any> => {
      return await mailSender.sendMail(transporterOption, mailOption);
    },
    sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
    setVar: (path: string, value: any) =>
      commonFunctions.setByPath(workflowData, path, value),
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
            (ctx: any) => ctx.connectionName === connectionId
          ) as TransactionContext;
        }
      }

      const tx = txContextEntry?.dbConnection;
      if (!tx)
        throw new Error(`${constants.messages.NO_DATA_FOUND}:${connectionId}`);

      const dbType = txContextEntry?.dbType;

      switch (dbType) {
        case constants.dbType.mysql:
          const [result] = await (tx as PoolConnection).query(
            sql,
            params || []
          );
          return result;

        case constants.dbType.postgres:
          const resultPg = await (tx as PoolClient).query(sql, params || []);
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
    warn: (message: any) => safeApi.log(message, "warn"),
  };
  return safeApi;
}

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

// -------------------- Built-in 액션 등록 --------------------
export function registerBuiltInActions(): void {
  // START 노드
  registerAction(
    constants.workflowActions.START,
    async (systemCode: string, node, workflowData, txContext, safeApi: any) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };
      try {
        if (!node) {
          result.error_code = -1;
          result.error_message = constants.messages.NO_DATA_FOUND;
          return result;
        }
        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);

          result.error_code = -1;
          result.error_message = `[${node.data.label}] node check result is invalid.`;
        }

        // Node main action
        workflowData.data.run.outputs = {};
        workflowData.data.run.outputs._SYSTEM = [];
        workflowData.data.run.outputs._SYSTEM[0] = { startTime: new Date() };

        postNodeCheck(node, workflowData);
        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
      } catch (e) {
        result.error_code = -1;
        result.error_message = `[${node.data.label}] ${JSON.stringify(e)}`;
        return result;
      }
      return result;
    }
  );

  // END 노드
  registerAction(
    constants.workflowActions.END,
    async (systemCode: string, node, workflowData, txContext, safeApi: any) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };
      try {
        if (!node) {
          result.error_code = -1;
          result.error_message = constants.messages.NO_DATA_FOUND;
          return result;
        }

        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);

          result.error_code = -1;
          result.error_message = `[${node.data.label}] node check result is invalid.`;
          return result;
        }

        workflowData.data.run.outputs._SYSTEM[0].endTime = new Date();
        workflowData.data.run.outputs._SYSTEM[0].durationMs =
          new Date(workflowData.data.run.outputs._SYSTEM[0].endTime).getTime() -
          new Date(
            workflowData.data.run.outputs._SYSTEM[0].startTime
          ).getTime();

        postNodeCheck(node, workflowData);

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (e) {
        result.error_code = -1;
        result.error_message = `[${node.data.label}] ${JSON.stringify(e)}`;
        return result;
      }
    }
  );

  // CALL 노드
  registerAction(
    constants.workflowActions.CALL,
    async (
      systemCode: string,
      node: any,
      workflowData: any,
      txContext: Map<string, TransactionContext>,
      safeApi: any
    ) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };
      try {
        if (!node) {
          result.error_code = -1;
          result.error_message = constants.messages.NO_DATA_FOUND;
          return result;
        }

        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);
          result.error_code = -1;
          result.error_message = `[${node.data.label}] node check result is invalid.`;
          return result;
        } // 실행할 다른 워크플로우 정보

        const { targetWorkflowId, targetWorkflowName } = node.data.design;
        if (!targetWorkflowId) {
          throw new Error("CALL node targetWorkflowId is not defined.");
        }

        // 하위 워크플로우 가져오기
        const subWorkflowResult = await getWorkflowByIdOrName(
          systemCode, // 동일 시스템 코드 사용
          targetWorkflowId
        );

        if (subWorkflowResult?.error_code !== 0) {
          throw new Error(`Target workflow not found: ${targetWorkflowId}`);
        }

        // 타입 가드
        if (
          "workflow_data" in subWorkflowResult &&
          subWorkflowResult.workflow_data
        ) {
          const subWorkflow: any = subWorkflowResult.workflow_data;
          result = await resetWorkflow(
            subWorkflow,
            systemCode,
            workflowData.userId
          );
          if (result.error_code != 0) {
            return result;
          }
          subWorkflow.data = subWorkflow.data || {};
          subWorkflow.data.run = subWorkflow.data.run || {};
          subWorkflow.data.run.inputs = node.data.run.inputs;

          // 호출시 전달할 input data
          result = await executeWorkflow(
            systemCode,
            subWorkflow,
            txContext,
            true
          );
          node.data.run.outputs = {
            ...(node.data.run.outputs || {}),
            ...(subWorkflow.data.run.outputs || {}),
          };

          if (result.error_code != 0) {
            throw new Error(result.error_message);
          }
        } else {
          throw new Error(
            `Target workflow not found or invalid: ${targetWorkflowId}`
          );
        }

        postNodeCheck(node, workflowData);
        return result;
      } catch (e: any) {
        result.error_code = -1;
        result.error_message = `[${node?.data?.label}] ${e.message}`;
        return result;
      }
    }
  );

  // SCRIPT 노드
  registerAction(
    constants.workflowActions.SCRIPT,
    async (
      systemCode: string,
      node: any,
      workflowData: any,
      txContext: any,
      safeApi: any
    ) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };

      const userScript =
        node.data.design.scriptContents || constants.General.EmptyString;
      const timeoutMs: number = node.data.design.timeoutMs || 50000;

      var res = null;

      try {
        const AsyncFunction = Object.getPrototypeOf(async function () {})
          .constructor as any;

        const fn = new AsyncFunction(
          "actionData",
          "workflowData",
          "api",
          userScript + "\n//# sourceURL=userScript.js"
        );

        res = await Promise.race([
          fn(node.data || {}, workflowData.data || {}, safeApi),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), timeoutMs)
          ),
        ]);

        postNodeCheck(node, workflowData);

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (e: any) {
        throw e;
      }
    }
  );

  // SQL 노드
  registerAction(
    constants.workflowActions.SQL,
    async (systemCode: string, node, workflowData, txContext, safeApi: any) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };
      var dbConnectionPool: DBConnectionPool | null = null;
      let connection: any = null;

      try {
        if (!preNodeCheck(node, workflowData)) {
          postNodeCheck(node, workflowData);
          result.error_code = -1;
          result.error_message = `[${node.data.label}] node check result is invalid.`;
        }

        const { dbConnectionId, sqlStmt, sqlParams, outputTableName } =
          node.data?.design || {};

        if (!dbConnectionId)
          throw new Error(
            `${constants.messages.REQUIRED_FIELD}:node.data.design.connetionId`
          );
        if (!sqlStmt)
          throw new Error(
            `${constants.messages.REQUIRED_FIELD}:node.data.design.sqlStmt`
          );

        dbConnectionPool =
          await DBConnectionManager.getInstance().getDBConnectionPool(
            dbConnectionId
          );

        if (!dbConnectionPool)
          throw new Error(
            `${constants.messages.NO_DATA_FOUND}: ${dbConnectionId}`
          );

        let rows: any = null;

        // ✅ 연결 가져오기
        connection = await DBConnectionManager.getInstance().getConnection(
          dbConnectionId
        );

        switch (connection.type) {
          case constants.dbType.mysql: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.mysql,
              workflowData
            );
            const [result] = await connection.dbConnection.query(sql, params);
            rows = result;
            break;
          }

          case constants.dbType.postgres: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.postgres,
              workflowData
            );
            const result = await connection.dbConnection.query(sql, params);
            if (result.command === "SELECT") {
              rows = result.rows;
            } else if (result.rowCount) {
              rows = [{ rowCount: result.rowCount }];
            }
            break;
          }

          case constants.dbType.mssql: {
            const { sql, params } = convertNamedParams(
              sqlStmt,
              sqlParams,
              constants.dbType.mssql,
              workflowData
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
              constants.dbType.oracle,
              workflowData
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
              `${constants.messages.NOT_SUPPORTED_DB_TYPE}: ${connection.type}`
            );
        }

        //  결과  저장
        node.data.run.outputs = {};
        if (rows) node.data.run.outputs[outputTableName] = rows;

        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (e: any) {
        throw e;
      } finally {
        // ✅ 커넥션 반환
        if (connection.dbConnection) {
          var releaseResult = null;
          try {
            switch (connection.type) {
              case constants.dbType.mysql:
              case constants.dbType.postgres:
                releaseResult = await connection.dbConnection.release();
                break;
              case constants.dbType.oracle:
                releaseResult = await connection.dbConnection.close();
                break;
              case constants.dbType.mssql:
                // mssql은 풀로 관리되므로 별도 close 없음
                break;
              default:
                throw new Error(constants.messages.NOT_SUPPORTED_DB_TYPE);
            }
          } catch (closeErr) {
            postNodeCheck(node, workflowData);
            throw closeErr;
          }
        }
        postNodeCheck(node, workflowData);
      }
    }
  );

  // BRANCH 노드
  registerAction(
    constants.workflowActions.BRANCH,
    async (
      systemCode: string,
      node: any,
      workflowData: any,
      txContext: any,
      safeApi: any
    ) => {
      var result = {
        error_code: -1,
        error_message: constants.General.EmptyString,
      };

      if (!preNodeCheck(node, workflowData)) {
        postNodeCheck(node, workflowData);
        result.error_code = -1;
        result.error_message = `[${node.data.label}] node check result is invalid.`;
      }

      try {
        if (!node) throw new Error(constants.messages.NO_DATA_FOUND);

        const design = node.data.design || {};
        const mode = design.mode;

        if (mode === constants.workflowBranchNodeMode.Branch) {
          const conditionStr = design.condition || "false";
          let conditionResult = false;

          try {
            const fnCondition = new Function(
              "workflowData",
              "api",
              `return ${conditionStr}`
            );
            conditionResult = !!fnCondition(workflowData, safeApi);
          } catch (e) {
            console.warn(
              `[Branch Node] condition 평가 오류: ${conditionStr}`,
              e
            );
          }

          // true/false 포트 결정
          node.data.run.selectedPort = conditionResult ? "true" : "false";
        } else if (mode === constants.workflowBranchNodeMode.Loop) {
          const loopStartValue = design.loopStartValue;
          const loopStepValue = design.loopStepValue;
          let loopLimitValue = null;

          try {
            const nodes = workflowData.nodes;
            const fnLoopLimit = new Function(
              "workflowData",
              "api",
              `return ${design.loopLimitValue || "0"}`
            );
            loopLimitValue = fnLoopLimit(workflowData, safeApi);
          } catch (e) {
            console.error("[Loop Node] limit 평가 오류:", e);
            loopLimitValue = 0;
          }

          var loopCurrentValue =
            design.loopCurrentValue ?? loopStartValue - loopStepValue;

          // 현재 인덱스 저장
          loopCurrentValue = loopCurrentValue + loopStepValue;
          node.data.design.loopCurrentValue = loopCurrentValue;

          if (loopCurrentValue < loopLimitValue) {
            node.data.run.selectedPort = "true"; // 루프 계속
          } else {
            node.data.run.selectedPort = "false"; // 루프 종료 후 다음노드 이동
            loopCurrentValue = -1;
            node.data.design.loopCurrentValue = loopStartValue - loopStepValue; // 시작변수 초기화
          }

          logger.info(
            `[Loop Node] currentIndex: ${loopCurrentValue}, limit: ${loopLimitValue}, nextIndex: ${node.data.design.loopCurrentValue}`
          );
        } else {
          throw new Error(`Unknown Branch mode: ${mode}`);
        }

        postNodeCheck(node, workflowData);

        // 스크립트 노드는 결과저장을 별도로 하지 않으며 스크립트내에서 자체적으로 저장해야 함.
        result.error_code = 0;
        result.error_message = constants.messages.SUCCESS_FINISHED;
        return result;
      } catch (e: any) {
        console.error(`[Branch Node ERROR]`, e);
        result.error_code = -1;
        result.error_message = `[${node?.data?.label}] ${e.message}`;
        return result;
      }
    }
  );
}

// SQL노드의 바인딩 변수에 매핑된 값을 찾아 매핑함
// 바인딩 변수 지정 기호: ${}
// 바인딩 변수 지정 경로 내에 인댁스 변수 지정 기호: #{}
function convertNamedParams(
  sqlStmt: string,
  sqlParams: { name: string; binding?: string; value?: any }[] = [],
  dbType: string,
  context: any
): { sql: string; params: any[] } {
  if (!sqlParams || sqlParams.length === 0) {
    return { sql: sqlStmt, params: [] };
  }

  let sql = sqlStmt;
  let params: any[] = [];

  // 파라미터 값이 바인딩인지 값인지 판단 후 실제 값으로 변환
  function resolveParam(
    p: { binding?: string; value?: any },
    context: any
  ): any {
    // 값은 그대로 사용함.
    if (!p.binding) {
      if (p.value == null || p.value == undefined) return null;
      else return p.value;
    }
    let bindingStr = p.binding;

    // 1. 먼저 #{} 안의 인덱스/루프 변수 치환
    bindingStr = bindingStr.replace(/#\{([^}]+)\}/g, (_, expr) => {
      const resolved = commonFunctions.getByPath(context, expr.trim());
      if (resolved === undefined)
        throw new Error(`Loop variable not found: ${expr}`);
      return resolved;
    });

    // 2. ${} 안의 일반 바인딩 변수 치환
    bindingStr = bindingStr.replace(/\$\{([^}]+)\}/g, (_, expr) => {
      const resolved = commonFunctions.getByPath(context, expr.trim());
      return resolved !== undefined ? resolved : constants.General.EmptyString;
    });

    // 3. 치환이 끝난 문자열이 단일 경로라면 실제 값 반환
    const finalValue = commonFunctions.getByPath(context, bindingStr);
    return finalValue !== undefined ? finalValue : bindingStr;
  }

  // DB 타입별 변환
  switch (dbType) {
    case constants.dbType.postgres:
      sqlParams.forEach((p, i) => {
        const pattern = new RegExp("@" + p.name + "\\b", "g");
        sql = sql.replace(pattern, "$" + (i + 1));
        params.push(resolveParam(p, context));
      });
      break;

    case constants.dbType.mysql:
      sqlParams.forEach((p) => {
        const pattern = new RegExp("@" + p.name + "\\b", "g");
        sql = sql.replace(pattern, "?");
        params.push(resolveParam(p, context));
      });
      break;

    case constants.dbType.mssql:
      params = sqlParams.map((p) => ({
        name: p.name,
        value: resolveParam(p, context),
      }));
      break;

    case constants.dbType.oracle:
      sqlParams.forEach((p) => {
        const pattern = new RegExp("@" + p.name + "\\b", "g");
        sql = sql.replace(pattern, ":" + p.name);
        params.push(resolveParam(p, context));
      });
      break;

    default:
      throw new Error("Unsupported DB type: " + dbType);
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
              {
                dbType: type as DBType,
                connectionName: constants.General.EmptyString,
              }, // 타입 단언
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
      let connectionName = info.connectionName || constants.General.EmptyString;
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

      try {
        // ③ 새 연결 생성
        const pool = dbManager.getPool(connectionId).pool;

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
      } catch (e) {
        logger.error(e);
      }
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
  systemCode: string,
  workflow: any,
  txContext: Map<string, TransactionContext> = new Map(),
  isSubWorkflow = false // 하위 워크플로우 여부
) {
  let result = { error_code: -1, error_message: constants.General.EmptyString };

  const nodesList = workflow.nodes;
  const edgesList = workflow.edges;
  const edgeMap: Record<string, any[]> = {};

  // source 노드 기준 edge 맵 생성
  edgesList.forEach((e: any) => {
    if (!e.source) return;
    if (!edgeMap[e.source]) edgeMap[e.source] = [];
    edgeMap[e.source]?.push(e);
  });

  async function traverse(
    systemCode: string,
    nodeId: string,
    txContext: Map<string, TransactionContext> = new Map(),
    isSubWorkflow = false
  ) {
    let result = {
      error_code: -1,
      error_message: constants.General.EmptyString,
    };

    const node = nodesList.find((n: any) => n.id === nodeId);
    if (!node) return result;

    // 노드 실행
    result = await runWorkflowStep(systemCode, node, workflow, txContext);
    if (result.error_code != 0) return result;

    // 다음 노드 선택
    const selectedPort = node.data.run?.selectedPort;

    for (const edge of edgeMap[nodeId] || []) {
      if (selectedPort) {
        if (edge.sourceHandle !== selectedPort && edge.id !== selectedPort)
          continue;
      }

      if (!edge.data?.condition || Boolean(edge.data.condition)) {
        // 하위 워크플로우는 isSub=true
        result = await traverse(
          systemCode,
          edge.target,
          txContext,
          isSubWorkflow
        );
        if (result.error_code != 0) return result;
      }
    }
    return result;
  }

  const startNode = nodesList.find(
    (n: any) => n.data.actionName === constants.workflowActions.START
  );
  if (!startNode) throw new Error("Start node not found");

  return await traverse(systemCode, startNode.id, txContext, isSubWorkflow);
}
// ---------------------------
// 5️⃣ 노드 단위 실행
// ---------------------------
export async function runWorkflowStep(
  systemCode: string,
  node: Node<any>,
  workflowData: any,
  txContext: Map<string, TransactionContext> = new Map()
) {
  const action = getAction(node.data.actionName);
  if (!action) throw new Error(`Unknown action: ${node.data.actionName}`);

  const safeApi = createSafeApi(workflowData, txContext);
  return await action(
    systemCode,
    node,
    workflowData,
    txContext ?? undefined,
    safeApi
  );
}

export async function saveWorkflow(
  systemCode: string,
  userId: string,
  workflowId: string,
  workflowData: any
) {
  var result = {
    error_code: -1,
    error_message: constants.General.EmptyString,
    workflow_data: {},
  };

  var sql = await dynamicSql.getSQL(
    systemCode,
    `select_TB_COR_WORKFLOW_MST`,
    1
  );
  var select_TB_COR_WORKFLOW_MST: any = await database.executeSQL(sql, [
    systemCode,
    workflowId,
  ]);

  var upsert_TB_COR_WORKFLOW_MST_01: any = null;
  if (select_TB_COR_WORKFLOW_MST.rowCount > 0) {
    // update
    sql = await dynamicSql.getSQL(systemCode, `update_TB_COR_WORKFLOW_MST`, 1);

    upsert_TB_COR_WORKFLOW_MST_01 = await database.executeSQL(sql, [
      systemCode,
      workflowId,
      workflowData,
      userId,
    ]);
  } else {
    // insert
    sql = await dynamicSql.getSQL(systemCode, `insert_TB_COR_WORKFLOW_MST`, 1);

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
  var result = { error_code: -1, error_message: constants.General.EmptyString };

  var sql = await dynamicSql.getSQL(
    systemCode,
    `select_TB_COR_WORKFLOW_MST`,
    1
  );
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
    sql = await dynamicSql.getSQL(systemCode, `delete_TB_COR_WORKFLOW_MST`, 1);

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

/**
 * 워크플로우 초기화
 * @param workflow 워크플로우 객체
 * @param systemCode 시스템 코드 (DB 저장용)
 * @param userId 사용자 ID (DB 저장용)
 */
export async function resetWorkflow(
  workflow: any,
  systemCode: string,
  userId: string
) {
  // 1️⃣ currentNodeId 초기화
  workflow.currentNodeId = workflow.nodes.find(
    (n: any) => n.data.actionName === constants.workflowActions.START
  ).id;

  // 2️⃣ 워크플로우 run 초기화
  if (workflow.data?.run) {
    Object.keys(workflow.data.run).forEach((key) => {
      workflow.data.run[key] = {};
    });
  }

  // 3️⃣ 각 노드 run 초기화
  if (Array.isArray(workflow.nodes)) {
    workflow.nodes.forEach((node: any) => {
      if (node.data?.run) {
        Object.keys(node.data.run).forEach((key) => {
          node.data.run[key] = {};
        });
      }
      node.data.status = constants.workflowRunStatus.idle; // 상태 초기화
    });
  }

  // 4️⃣ DB 저장
  const saveResult = await saveWorkflow(
    systemCode,
    userId,
    workflow.workflowId,
    workflow
  );
  if (saveResult.error_code !== 0) {
    throw new Error(`${saveResult.error_message}`);
  }
  saveResult.workflow_data = workflow;
  return saveResult;
}

export async function getWorkflowList(systemCode: string, userId: string) {
  try {
    // 워크플로우 목록 조회 쿼리 (DB 구조에 맞게 수정 가능)
    const sql = await dynamicSql.getSQL(
      systemCode,
      `select_TB_COR_WORKFLOW_MST`,
      2
    );

    var select_TB_COR_WORKFLOW_MST: any = await database.executeSQL(sql, [
      systemCode,
    ]);

    return {
      error_code: 0,
      list: select_TB_COR_WORKFLOW_MST, // [{id, workflow_data}, ...]
    };
  } catch (e: any) {
    console.error("getWorkflowList 오류:", e);
    return {
      error_code: -1,
      error_message: String(e.message || e),
      list: [],
    };
  }
}

export async function getWorkflowByIdOrName(
  systemCode: string,
  workflowIdOrName: string
) {
  try {
    // 1️⃣ SQL 조회
    const sql = await dynamicSql.getSQL(
      systemCode,
      "select_TB_COR_WORKFLOW_MST",
      1
    );
    const dbResult: any = await database.executeSQL(sql, [
      systemCode,
      workflowIdOrName,
    ]);

    // 2️⃣ 조회 결과 확인
    var result = {
      error_code: -1,
      error_message: constants.General.EmptyString,
      workflow_data: {},
    };
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

    return result;
  } catch (e: any) {
    return null;
  }
}

await initializeWorkflowEngine();
