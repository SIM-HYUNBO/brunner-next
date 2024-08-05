`use strict`

import logger from "./../../winston/logger"
import { Pool } from "pg";

const getPool = async () => {

  logger.info(`Getting database connection pool from ...
  DB_HOST:${process.env.DB_HOST}
  DB_PORT:${process.env.DB_PORT}
  DB_DATABASE:${process.env.DB_DATABASE}
  DB_USER:${process.env.DB_USER}
  DB_PASSWORD:${process.env.DB_PASSWORD}
  SSL_MODE:${process.env.SSL_MODE}\n`);

  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: true
  });
};

const executeSQL = async (sql, params) => {
  try {
    if (!sql) {
      throw new Exception("SQL not loaded.")
    }
    logger.info(`SQL:\n${sql}\nPARAMS:${JSON.stringify(params)}\n`);
    return await (await getPool()).query(sql, params);
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};

export { executeSQL };