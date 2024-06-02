`use strict`

import dotenv from 'dotenv'
import logger from "../winston/logger"
import * as database from './database/database'

export default function executeService(jRequest) {
  var jResponse = {};

  try {
    switch (jRequest.commandName) {
      case "serviceSQL.loadAllSQL":
        jResponse = loadAllSQL();
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

async function loadAllSQL() {
  var result = {};
  try {
    result.error_code = 0;
    result.error_message = '';

    // 이미 로딩했으면 로딩 안하고 
    if (process && process.serviceSQL && process.serviceSQL.size > 0) {  // 성공 리턴
      result.error_message = 'The ServiceSQLs already loaded';
      result.error_code = 1;
      return result;
    }

    dotenv.config();
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

    result.error_message = 'The ServiceSQLs first loaded';
    result.error_code = 0;

    return result;
  }
  catch (err) {
    result.error_code = -1;
    result.error_message = `An exception occured while loading serviceSQL.\nerror:${err}`;
    return result;
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

export function getSQL00(sqlName, sqlSeq) {
  try {
    var sql = getSQL(process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
    return sql;
  }
  catch (err) {
    throw err;
  }
};