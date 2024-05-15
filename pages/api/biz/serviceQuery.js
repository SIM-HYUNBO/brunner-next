`use strict`

import logger from "./../winston/logger"
import * as database from './database/database'

export async function loadServiceQuery() {
  try {
    // 처음 한번만 로딩해야 함.
    if (!process.serviceQuery || process.serviceQuery.size === 0) {

      process.serviceQuery = new Map();
      logger.info(`Start loading service queries.\n`)

      var sql = `
      SELECT SYSTEM_CODE, SQL_NAME, SQL_SEQ, SQL_CONTENT
        FROM BRUNNER.TB_COR_SQL_INFO
       WHERE SYSTEM_CODE = $1
       ;`;

      const result = await database.getPool().query(sql, ["00"]);

      result.rows.forEach(row => {
        process.serviceQuery.set(`${row.system_code}_${row.sql_name}_${row.sql_seq}`, row.sql_content);
      });

      logger.info(`End loading service queries.\n`)
    }
  }
  catch (err) {
    throw err;
  }
  finally {

  }
};

export function getSQL(systemCode, sqlName, sqlSeq) {
  try {
    var sql = process.serviceQuery.get(`${systemCode}_${sqlName}_${sqlSeq}`);
    return sql;
  }
  catch (err) {
    throw err;
  }
};

export function getDefaultSQL(sqlName, sqlSeq) {
  try {
    var sql = getSQL(process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
    return sql;
  }
  catch (err) {
    throw err;
  }
};