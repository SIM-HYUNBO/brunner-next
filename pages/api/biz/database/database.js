`use strict`
import dotenv from 'dotenv'
import logger from "./../../winston/logger"
import { Pool } from "pg";


export const getPool = () => {
  dotenv.config();

  logger.info(`Getting database connection pool from ...
  DB_HOST:${process.env.DB_HOST}
  DB_PORT:${process.env.DB_PORT}
  DB_DATABASE:${process.env.DB_DATABASE}
  DB_USER:${process.env.DB_USER}
  DB_PASSWORD:${process.env.DB_PASSWORD}
  SSL_MODE:${process.env.SSL_MODE}
  `);

  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: true
  });
};

export const querySQL = async (dbConnectionPool, sql, params) => {
  try {
    logger.info(`
SQL:\n${sql}
PARAMS:
    ${JSON.stringify(params)}`)

    const result = await dbConnectionPool.query(sql, params);
    return result;
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};

export const executeSQL = async (dbConnectionPool, sql, params) => {
  try {
    logger.info(`
SQL:\n${sql}\n
PARAMS:\n
    ${JSON.stringify(params)}`)

    const result = await dbConnectionPool.execute(sql, params);
    return result;
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};