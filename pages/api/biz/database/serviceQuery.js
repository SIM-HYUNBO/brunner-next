`use strict`

import logger from "./../../winston/logger"

export function getSQL(dbConnectionPool, systemCode, sqlName, sqlSeq) {
  try {
    if (!process.serviceQuery) {
      loadServiceQuery(dbConnectionPool);
    }

    return process.serviceQuery.get(`${systemCode}_${sqlName}_${sqlSeq}`);
  }
  catch (err) {
    throw err;
  }
};

export function getDefaultSQL(dbConnectionPool, sqlName, sqlSeq) {
  try {
    return getSQL(dbConnectionPool, process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE, sqlName, sqlSeq);
  }
  catch (err) {
    throw err;
  }
};

async function loadServiceQuery(dbConnectionPool) {
  process.serviceQuery = new Map();
  try {
    logger.info(`Start loading service queries.)}\n`)

    const result = await dbConnectionPool.query(`
    SELECT SYSTEM_CODE, SQL_NAME, SQL_SEQ, SQL_CONTENT
      FROM BRUNNER.TB_COR_SQL_INFO
     WHERE SYSTEM_CODE = '${process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE}'
     ;`, []);

    result.rows.forEach(row => {
      process.serviceQuery.set(`${row.system_code}_${row.sql_name}_${row.sql_seq}`, row.sql_content);
    });
    logger.info(`Complete loading service queries.)}\n`)

    // console.log('Data from PostgreSQL:');
    // resultMap.forEach((value, key) => {
    //     console.log(`Key: ${key}, Value: ${value}`);
    // });
  }
  catch (err) {
    throw err;
  }
  finally {
    return process.serviceQuery;
  }
};