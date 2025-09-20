"use strict";

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as database from "./biz/database/database";
import * as dynamicSql from "./biz/dynamicSql";
import * as security from "./biz/security";
import * as postInfo from "./biz/postInfo";
import * as postCommentInfo from "./biz/postCommentInfo";
import * as edocComponentTemplate from "./biz/eDoc/eDocComponentTemplate";
import * as edocDocument from "./biz/eDoc/eDocDocument";
import * as edocCustom from "./biz/eDoc/eDocCustom";

/**
 * 최종 서버 핸들러
 */
export default async (req, res) => {
  // ✅ 서버 준비 상태 대기
  await initializeServer();
  await waitUntilReady();

  const remoteIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let jRequest =
    req.method === constants.httpMethod.GET ? JSON.parse(req.params.requestJson) : req.body;
  const txnId = await generateTxnId();
  jRequest._txnId = txnId;
  const commandName = jRequest.commandName || "";

  let jResponse = {};
  let exception = null;

  logger.warn(`START TXN ${commandName} from ${remoteIp}`);

  const startTxnTime = Date.now();
  try {
    const response = await executeService(req.method, req);
    jResponse = commonFunctions.isJsonObject(response)
      ? response
      : JSON.parse(response.toString());
  } catch (e) {
    exception = e.message || e;
    jResponse = { error_code: -1, error_message: exception };
    logger.error(`Error in TXN ${commandName}: ${exception}`);
  } finally {
    const durationMs = Date.now() - startTxnTime;
    jResponse._txnId = txnId;
    jResponse._durationMs = durationMs;
    jResponse._exception = exception;

    res.json(jResponse);
    logger.warn(
      `END TXN ${commandName} in ${durationMs} ms. Response: ${JSON.stringify(
        jResponse
      )}`
    );

    saveTxnHistoryAsync(remoteIp, txnId, jRequest, jResponse);
  }
};

/**
 * 트랜잭션 ID 생성
 */
const generateTxnId = async () => {
  const now = new Date();
  const currentDateTime = now.toISOString().replace(/[-:.TZ]/g, "");
  const hrtime = process.hrtime();
  return `${currentDateTime}${hrtime[0]}${hrtime[1]}`;
};

let isReady = false;
let readyPromise = null;
let serviceSql = null;

export async function initializeServer() {
  if (isReady) return Promise.resolve(); // 이미 초기화가 완료되었으면 그냥 통과
  if (readyPromise) return readyPromise; // 이미 초기화가 시작되었으면 실행중인 함수 promise 반환

  console.log("Loading Service SQL ...");

  // 즉시 실행 async 함수로 Promise 생성
  readyPromise = (async () => {
    if (!process.serviceSql) {
      process.serviceSql = await dynamicSql.loadAll();
      serviceSql = process.serviceSql;
      logger.info(`Service SQL loaded: ${serviceSql.size}`);
    } else {
      serviceSql = process.serviceSql;
    }

    isReady = true; // 초기화 완료 표시
  })();

  return readyPromise;
}

export function waitUntilReady() {
  return isReady ? Promise.resolve() : readyPromise;
}

/**
 * 모듈 맵 기반 서비스 실행
 */
const moduleMap = {
  [constants.modulePrefix.security]: security.executeService,
  [constants.modulePrefix.dynamicSql]: dynamicSql.executeService,
  [constants.modulePrefix.postInfo]: postInfo.executeService,
  [constants.modulePrefix.postCommentInfo]: postCommentInfo.executeService,
  [constants.modulePrefix.edocComponentTemplate]:
    edocComponentTemplate.executeService,
  [constants.modulePrefix.edocDocument]: edocDocument.executeService,
  [constants.modulePrefix.edocCustom]: edocCustom.executeService,
};

const executeService = async (method, req) => {
  const jRequest =
    method === constants.httpMethod.GET ? JSON.parse(req.params.requestJson) : req.body;
  const commandName = jRequest.commandName;

  if (!commandName) {
    return {
      error_code: -1,
      error_message: `${constants.messages.SERVER_NO_COMMAND_NAME}\n${constants.messages.SERVER_NOT_SUPPORTED_MODULE}`,
    };
  }

  for (const prefix in moduleMap) {
    if (commandName.startsWith(`${prefix}.`)) {
      // 서버 초기화는 이미 API 핸들러에서 await 하고 있음
      return moduleMap[prefix](jRequest._txnId, jRequest);
    }
  }

  return {
    error_code: -1,
    error_message: `[${commandName}] ${constants.messages.SERVER_NOT_SUPPORTED_MODULE}`,
  };
};

/**
 * 트랜잭션 로그 비동기 저장
 */
const saveTxnHistoryAsync = (remoteIp, txnId, jRequest, jResponse) => {
  setImmediate(async () => {
    try {
      const reducedRequest = {
        commandName: jRequest.commandName,
        userId: jRequest.userId,
        timestamp: jRequest.timestamp,
      };
      const reducedResponse = {
        durationMs: jResponse._durationMs,
        exception: jResponse._exception,
      };

      const sql = await dynamicSql.getSQL00("insert_TB_COR_TXN_HIST", 1);
      await database.executeSQL(sql, [
        txnId,
        remoteIp,
        JSON.stringify(reducedRequest),
        JSON.stringify(reducedResponse),
      ]);
    } catch (e) {
      logger.error(`${constants.messages.FAILED_TO_SAVE_TXN_HISTORY}: ${e}`);
    }
  });
};
