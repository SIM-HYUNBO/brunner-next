"use strict";

import logger from "../../components/core/server/winston/logger";
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
 * 서버 시작 시 SQL 캐시 로드
 */
let serviceSql = null;
export async function initializeServer() {
  if (!process.serviceSQL) {
    process.serviceSQL = await dynamicSql.loadAll();
    serviceSql = process.serviceSQL;
    logger.info(`Dynamic SQL loaded: ${serviceSql.size}`);
  } else {
    serviceSql = process.serviceSQL;
  }
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

let initialized = false;
const executeService = async (method, req) => {
  if (!initialized)
    initializeServer()
      .then(() => {
        logger.info("Server initialized.");
        initialized = true;
      })
      .catch((err) => {
        logger.error("Failed to initialize server.");
        process.exit();
      });

  const jRequest =
    method === "GET" ? JSON.parse(req.params.requestJson) : req.body;
  const commandName = jRequest.commandName;

  if (!commandName) {
    return {
      error_code: -1,
      error_message: `${constants.messages.SERVER_NO_COMMAND_NAME}\n${constants.messages.SERVER_NOT_SUPPORTED_MODULE}`,
    };
  }

  for (const prefix in moduleMap) {
    if (commandName.startsWith(`${prefix}.`)) {
      return moduleMap[prefix](req.body._txnId, jRequest);
    }
  }

  return {
    error_code: -1,
    error_message: `[${commandName}] ${constants.messages.SERVER_NOT_SUPPORTED_MODULE}`,
  };
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
      logger.error(`Failed to save transaction history: ${e}`);
    }
  });
};

/**
 * 최종 서버 핸들러
 */
export default async (req, res) => {
  const startTxnTime = Date.now();
  const remoteIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let jRequest =
    req.method === "GET" ? JSON.parse(req.params.requestJson) : req.body;
  const txnId = await generateTxnId();
  jRequest._txnId = txnId;
  const commandName = jRequest.commandName || "";

  let jResponse = {};
  let exception = null;

  logger.warn(`START TXN ${commandName} from ${remoteIp}`);

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
