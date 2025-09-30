// src/engine/db/DBConnectionManager.ts
import * as constants from "@/components/core/constants";
import * as database from "./../database/database";
import * as dynamicSql from "./../dynamicSql";

import { Pool as PgPool } from "pg";
import mysql from "mysql2/promise";
import mssql from "mssql";
import oracledb from "oracledb";

// ---------------------------
// 타입 정의
// ---------------------------
export type DBType = "postgres" | "mysql" | "mssql" | "oracle";

export interface DBConnectionConfig {
  id: string;
  name: string;
  type: DBType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  options?: Record<string, any>;
}

export interface DBConnectionPool {
  type: DBType;
  pool: any;
}

// ---------------------------
// DBConnectionManager 본체
// ---------------------------
export class DBConnectionManager {
  private constructor (){}
  private static instance:DBConnectionManager;
  public static getInstance():DBConnectionManager {
    if(!DBConnectionManager.instance)
      DBConnectionManager.instance = new DBConnectionManager();
    return DBConnectionManager.instance;
  }

  private connections: Map<string, DBConnectionConfig> = new Map();
  private pools: Map<string, DBConnectionPool> = new Map();

  async loadAllFromDatabase(database: any, dynamicSql: any) {
    const dbConnections = await this.selectDBConnections(
      process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE ?? "00",
      database,
      dynamicSql
    );
    for (const conn of dbConnections) {
      await this.register(conn, true);
    }
  }

  // ✅ 연결정보 등록
  async register(config: DBConnectionConfig, onlyLoad:boolean = false) {
    var result = null;
    if (this.connections.has(config.id)) {
      result = await this.update(config);
    } else {
      const pool = await this.createPool(config);
      this.connections.set(config.id, config);
      this.pools.set(config.id, { type: config.type, pool });
      
      if(onlyLoad == false)
        result = await this.insertDBConnection(config, database, dynamicSql);
    }
    return result;
  }

  // ✅ 연결정보 수정
async update(config: DBConnectionConfig) {
  if (!this.connections.has(config.id)) {
    throw new Error(`DB connection with ID ${config.id} not found`);
  }

  // 기존 연결정보 가져오기
  const existingConfig = this.connections.get(config.id)!;

  // 필요한 경우 연결 풀 교체 (host, port, username, password, database 등 핵심 정보가 바뀐 경우)
  const needNewPool =
    existingConfig.type !== config.type ||
    existingConfig.host !== config.host ||
    existingConfig.port !== config.port ||
    existingConfig.username !== config.username ||
    existingConfig.password !== config.password ||
    existingConfig.database !== config.database;

  if (needNewPool) {
    // 기존 풀 닫기
    const oldPool = this.pools.get(config.id);
    if (oldPool) await this.closePool(oldPool);

    // 새 풀 생성
    const newPool = await this.createPool(config);
    this.pools.set(config.id, { type: config.type, pool: newPool });
  }

  // connections Map 업데이트 (부분 필드 업데이트 가능)
  this.connections.set(config.id, { ...existingConfig, ...config });

  // DB에 업데이트
  return await this.updateDBConnection(config, database, dynamicSql);
}


  // ✅ 연결정보 삭제
  async remove(id: string) {
    const poolObj = this.pools.get(id);
    if (poolObj) {
      await this.closePool(poolObj);
    }
    this.connections.delete(id);
    this.pools.delete(id);
    const result = await this.deleteDBConnection(id, database, dynamicSql);
    return result;
  }

  // ✅ 등록된 연결정보 목록 조회
  list(): DBConnectionConfig[] {
    return Array.from(this.connections.values());
  }

  // ✅ 연결 획득
  async getConnection(id: string): Promise<any> {
    const poolObj = this.pools.get(id);
    if (!poolObj) throw new Error(`No pool found for DB ID ${id}`);

    switch (poolObj.type) {
      case "postgres":
        return await poolObj.pool.connect();
      case "mysql":
        return await poolObj.pool.getConnection();
      case "mssql":
        return poolObj.pool;
      case "oracle":
        return await poolObj.pool.getConnection();
      default:
        throw new Error(`Unsupported DB type: ${poolObj.type}`);
    }
  }

  // ✅ 연결 풀 생성
  private async createPool(config: DBConnectionConfig) {
    switch (config.type) {
      case "postgres":
        return new PgPool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: true,
          max: 10,
        });

      case "mysql":
        return mysql.createPool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          connectionLimit: 10,
        });

      case "mssql":
        return await mssql.connect({
          user: config.username,
          password: config.password,
          database: config.database,
          server: config.host,
          port: config.port,
          pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
          options: { encrypt: false, trustServerCertificate: true },
        });

      case "oracle":
        return await oracledb.createPool({
          user: config.username,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database}`,
          poolMax: 10,
          poolMin: 0,
        });

      default:
        throw new Error(`Unsupported DB type: ${config.type}`);
    }
  }

  // ✅ 연결풀 닫기
  private async closePool(poolObj: DBConnectionPool) {
    try {
      if (poolObj.type === "mssql") await mssql.close();
      else if (poolObj.type === "oracle") await poolObj.pool.close(0);
      else await poolObj.pool.end();
    } catch (err) {
      console.error(`Error closing pool:`, err);
    }
  }

  // ✅ 연결 테스트
  async testConnection(config: DBConnectionConfig): Promise<boolean> {
    try {
      const pool = await this.createPool(config);
      let conn: any;
      switch (config.type) {
        case "postgres":
          conn = await pool.connect();
          await conn.query("SELECT 1");
          conn.release();
          break;
        case "mysql":
          conn = await pool.getConnection();
          await conn.query("SELECT 1");
          conn.release();
          break;
        case "mssql":
          await pool.request().query("SELECT 1");
          break;
        case "oracle":
          conn = await pool.getConnection();
          await conn.execute("SELECT 1 FROM DUAL");
          await conn.close();
          break;
      }
      await this.closePool({ type: config.type, pool });
      return true;
    } catch (err) {
      console.error(`DB connection test failed:`, err);
      return false;
    }
  }

  // ✅ DB 연결정보 조회
  async selectDBConnections(
    systemCode: string,
    database: any,
    dynamicSql: any
  ) {
    const jResponse: any = {};
    try {
      const sql = await dynamicSql.getSQL00("select_TB_WF_DBCONNECTIONS", 1);
      const sqlResult = await database.executeSQL(sql, [systemCode]); // 필요 시 파라미터 사용

      return sqlResult.rows;
    } catch (err: any) {
      throw err;
    }
  }

  // ✅ DB 연결정보 등록
  async insertDBConnection(
    dbConnectionConfig: any,
    database: any,
    dynamicSql: any
  ) {
    var result: any = {};
    var sqlResult = null;

    try {
      const sql = await dynamicSql.getSQL00("insert_TB_WF_DBCONNECTIONS", 1);
      sqlResult = await database.executeSQL(sql, [
        dbConnectionConfig.system_code,
        dbConnectionConfig.name,
        dbConnectionConfig.type,
        dbConnectionConfig.host,
        dbConnectionConfig.port,
        dbConnectionConfig.username,
        dbConnectionConfig.password,
        dbConnectionConfig.database_name,
        JSON.stringify(dbConnectionConfig.additional_info || {}),
      ]);

      if (sqlResult.rows && sqlResult.rows.length > 0) {
        result.insertedId = sqlResult.rows[0]?.id;
      }
      result.error_code = 0;
      result.error_message = constants.messages.EMPTY_STRING;
    } catch (err: any) {
      console.error(err);
      result.error_code = -1;
      result.error_message = err.message;
    }
    return result;
  }

  // ✅ DB 연결정보 수정
  async updateDBConnection(
    dbConnectionConfig: any,
    database: any,
    dynamicSql: any
  ) {
    var result: any = {};
    try {
      var sql = await dynamicSql.getSQL00("update_TB_WF_DBCONNECTIONS", 1);
      var sqlResult = await database.executeSQL(sql, [
        dbConnectionConfig.name,
        dbConnectionConfig.type,
        dbConnectionConfig.host,
        dbConnectionConfig.port,
        dbConnectionConfig.username,
        dbConnectionConfig.password,
        dbConnectionConfig.database,
        JSON.stringify(dbConnectionConfig.additional_info || {}),
        dbConnectionConfig.id,
      ]);

      if (sqlResult.rowCount === 1) {
        result.error_code = 0;
        result.error_message = constants.messages.EMPTY_STRING;
      } else {
        result.error_code = -1;
        result.error_message = constants.messages.FAILED_TO_UPDATE_DATA;
      }
    } catch (err: any) {
      console.error(err);
      result.error_code = -1;
      result.error_message = err.message;
    }
    return result;
  }

  // ✅ DB 연결정보 삭제
  async deleteDBConnection(
    dbConnectionId: any,
    database: any,
    dynamicSql: any
  ) {
    const result: any = {};
    try {
      const sql = await dynamicSql.getSQL00("delete_TB_WF_DBCONNECTIONS", 1);
      const sqlResult = await database.executeSQL(sql, [dbConnectionId]);

      if (sqlResult.rowCount === 1) {
        result.error_code = 0;
        result.error_message = constants.messages.EMPTY_STRING;
      } else {
        result.error_code = -1;
        result.error_message = constants.messages.FAILED_TO_DELETE_DATA;
      }
    } catch (err: any) {
      console.error(err);
      result.error_code = -1;
      result.error_message = err.message;
    }
    return result;
  }
}
