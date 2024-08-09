`use strict`

import logger from "../winston/logger"
import * as database from './database/database'

const executeService = async (txnId, jRequest) => {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case "serviceSQL.loadAllSQL":
        jResponse = loadAllSQL(txnId);
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

async function loadAllSQL(txnId) {
  try {

    // 이미 로딩했으면 로딩 안하고 성공 리턴
    if (process && process.serviceSQL && process.serviceSQL.size > 0) {
      return process.serviceSQL;
    }

    logger.info(`Start loading service queries.\n`)

    process.serviceSQL = new Map();

    var sql = `
    SELECT SYSTEM_CODE, 
           SQL_NAME, 
           SQL_SEQ, 
           SQL_CONTENT
      FROM BRUNNER.TB_COR_SQL_INFO
      ;`;

    const sql_result = await database.executeSQL(sql, []);

    sql_result.rows.forEach(row => {
      process.serviceSQL.set(`${row.system_code}_${row.sql_name}_${row.sql_seq}`, row.sql_content);
    });

    return process.serviceSQL;
  }
  catch (err) {
    throw err;
  }
};

const getSQL = async (systemCode, sqlName, sqlSeq) => {
  try {

    var sql = process.serviceSQL.get(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

const getSQL00 = async (sqlName, sqlSeq) => {
  try {
    var sql = await getSQL(process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

export { executeService, getSQL, getSQL00, loadAllSQL };
