`use strict`

import dotenv from 'dotenv'
import logger from "../winston/logger"
import * as database from './database/database'
import { json } from 'express';

export default function executeService(jRequest) {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case "serviceSQL.loadAllSQL":
        loadAllSQL();
        jResponse.error_message = `suceess loading serviceSQL`;
        break;
      default:
        break;
    }
  } catch (error) {
    logger.error(error);
    jResponse.error_message = JSON.stringify(error);
  } finally {
    return jResponse;
  }
}

/* 
쿼리를 DB에서 모두 로딩함 
처음 시작할 때 한번만 로딩함.

*/
async function loadAllSQL() {
  try {
    dotenv.config();

    if (!process.serviceSQL || process.serviceSQL.size === 0) {
      logger.info(`Start loading service queries.\n`)

      process.serviceSQL = new Map();

      var sql = `
      SELECT SYSTEM_CODE, SQL_NAME, SQL_SEQ, SQL_CONTENT
        FROM BRUNNER.TB_COR_SQL_INFO
       WHERE SYSTEM_CODE = $1
       ;`;

      const result = await database.getPool().query(sql, ["00"]);

      result.rows.forEach(row => {
        process.serviceSQL.set(`${row.system_code}_${row.sql_name}_${row.sql_seq}`, row.sql_content);
      });

      logger.info(`End loading service queries.\n`)

      return 0; // 정상로딩
    }
    else {
      return 1; // 이미 로딩되어 있어서 로딩 안했음 
    }
  }
  catch (err) {
    logger.info(`An exception occured while loading serviceSQL.\n`)

    throw err; // 로딩 중 오류 발생
  }
  finally {
    ;
  }
};

export function getSQL(systemCode, sqlName, sqlSeq) {
  try {
    var sql = process.serviceSQL.get(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

export function getDefaultSystemSQL(sqlName, sqlSeq) {
  try {
    var sql = getSQL(process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
    return sql;
  }
  catch (err) {
    throw err;
  }
};