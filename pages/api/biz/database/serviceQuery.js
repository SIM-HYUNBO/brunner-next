`use strict`
import dotenv from 'dotenv'
import * as database from './database'
import logger from "./../../winston/logger"

loadServiceQuery(database.getPool(), 'SELECT SQL_NAME, SQL_CONTENT FROM TB_SERVICE_QUERY_INFO', {});

export const loadServiceQuery = async (dbConnectionPool, sql, params) => {
  try {
    logger.info(`Start loading service queries.)}\n`)

    const result = await dbConnectionPool.query(sql, params);

    const serviceQuery = new Map(); 
    result.rows.forEach(row => {
        serviceQuery.set(row.key_column, row.value_column);
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
  finally{
    return serviceQuery;
  }
};