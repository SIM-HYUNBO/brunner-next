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
  SSL_MODE:${process.env.SSL_MODE}\n`);

  return new Pool({
    user: 'brunner', // process.env.DB_USER,
    host: 'ep-cold-resonance-a47aecbi-pooler.us-east-1.aws.neon.tech', // process.env.DB_HOST,
    database: 'brunner', // process.env.DB_DATABASE,
    password: 'oniV6xuA3Gbk', // process.env.DB_PASSWORD,
    port: 5432, // process.env.DB_PORT,
    ssl: true
  });
};

export const executeSQL = async (dbConnectionPool, sql, params) => {
  try {
    logger.info(`SQL:\n${sql}\nPARAMS:${JSON.stringify(params)}\n`)

    const result = await dbConnectionPool.query(sql, params);
    return result;
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};