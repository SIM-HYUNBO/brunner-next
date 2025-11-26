"use strict";

import logger from "@/components/core/server/winston/logger";
import * as constants from "@/components/core/constants";
import * as commonFunctions from "@/components/core/commonFunctions";
import * as database from "@/pages/api/biz/database/database";
import * as dynamicSql from "@/pages/api/biz/dynamicSql";
import * as security from "@/pages/api/biz/security";
import * as postInfo from "@/pages/api/biz/postInfo";
import * as postCommentInfo from "@/pages/api/biz/postCommentInfo";
import * as edocComponentTemplate from "./biz/eDoc/eDocComponentTemplate";
import * as edocDocument from "@/pages/api/biz/eDoc/eDocDocument";
import * as edocCustom from "@/pages/api/biz/eDoc/eDocCustom";
import * as workflow from "@/pages/api/biz/workflow";
import * as pharmacy from "@/pages/api/biz/pharmacy/pharmacy";

export const config = {
  api: {
    bodyParser: false, // multipart 업로드 하려면 무조건 끄기
    responseLimit: "100mb",
  },
};

/**
 * 최종 서버 핸들러
 */
export default async (req, res) => {
  await initializeServer();
  await waitUntilReady();

  const remoteIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // 모든 도메인 허용 (필수)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET 요청 처리
  let jRequest;
  if (req.method === constants.httpMethod.GET) {
    throw new Error(constants.messages.SERVER_NOT_SUPPORTED_METHOD);
  } else {
    // POST/PUT 등은 bodyParser가 꺼졌으므로 직접 읽기
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const rawBody = Buffer.concat(buffers).toString();
    jRequest = JSON.parse(rawBody);
  }

  const txnId = await generateTxnId();
  jRequest._txnId = txnId;
  const commandName = jRequest.commandName || constants.General.EmptyString;

  let jResponse = {};
  let exception = null;

  logger.warn(`START TXN ${commandName} from ${remoteIp}`);
  const startTxnTime = Date.now();

  try {
    const response = await executeService(jRequest);
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
    logger.warn(`END TXN ${commandName} in ${durationMs} ms`);
  }
};

/**
 * 트랜잭션 ID 생성
 */
const generateTxnId = async () => {
  const now = new Date();
  const currentDateTime = now
    .toISOString()
    .replace(/[-:.TZ]/g, constants.General.EmptyString);
  const hrtime = process.hrtime();
  return `${currentDateTime}${hrtime[0]}${hrtime[1]}`;
};

let isReady = false;
let readyPromise = null;
let serviceSql = null;

export async function initializeServer() {
  if (isReady) return Promise.resolve(); // 이미 초기화가 완료되었으면 그냥 통과
  if (readyPromise) return readyPromise; // 이미 초기화가 시작되었으면 실행중인 함수 promise 반환

  logger.info("Loading Service SQL ...");

  // 즉시 실행 async 함수로 Promise 생성
  readyPromise = (async () => {
    if (!process.serviceSql) {
      process.serviceSql = await dynamicSql.loadAll();
      serviceSql = process.serviceSql;
      logger.info(`Service SQL loaded: ${serviceSql?.size}`);
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
  [constants.modulePrefix.workflow]: workflow.executeService,

  [constants.modulePrefix.pharmacy]: pharmacy.executeService,
};

const executeService = async (jRequest) => {
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
const saveTxnHistoryAsync = (
  systemCode,
  remoteIp,
  txnId,
  jRequest,
  jResponse
) => {
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

      const sql = await dynamicSql.getSQL(
        systemCode,
        "insert_TB_COR_TXN_HIST",
        1
      );
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
