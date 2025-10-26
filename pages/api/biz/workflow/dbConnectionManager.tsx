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
  database_name: string;
  options?: Record<string, any>;
}

export interface DBConnectionPool {
  name: string;
  type: DBType;
  pool: any;
}

// ---------------------------
// DBConnectionManager 본체
// ---------------------------
export class DBConnectionManager {
  private initTime;
  private constructor() {
    this.initTime = new Date();
  }

  public static getInstance(): DBConnectionManager {
    if (!(globalThis as any)._dbConnectionManager) {
      console.log("🆕 Creating global DBConnectionManager instance");
      (globalThis as any)._dbConnectionManager = new DBConnectionManager();
    } else {
      console.log("♻️ Reusing global DBConnectionManager instance");
    }
    return (globalThis as any)._dbConnectionManager;
  }

  private dbConnectionConfig: Map<string, DBConnectionConfig> = new Map();
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
  async register(config: DBConnectionConfig, onlyLoad: boolean = false) {
    var result = null;
    if (this.dbConnectionConfig.has(config.id)) {
      result = await this.update(config);
    } else {
      const pool = await this.createPool(config);
      this.dbConnectionConfig.set(config.id, config);
      this.pools.set(config.id, { name: config.name, type: config.type, pool });

      console.log(`onlyload =${onlyLoad}`);
      if (!onlyLoad) {
        result = await this.insertDBConnection(config, database, dynamicSql);
      }
    }
    return result;
  }

  // ✅ 연결정보 수정
  async update(config: DBConnectionConfig) {
    if (!this.dbConnectionConfig.has(config.id)) {
      throw new Error(`DB connection with ID ${config.id} not found`);
    }

    // 기존 연결정보 가져오기
    const existingConfig = this.dbConnectionConfig.get(config.id)!;

    // 필요한 경우 연결 풀 교체 (host, port, username, password, database 등 핵심 정보가 바뀐 경우)
    const needNewPool =
      existingConfig.type !== config.type ||
      existingConfig.host !== config.host ||
      existingConfig.port !== config.port ||
      existingConfig.username !== config.username ||
      existingConfig.password !== config.password ||
      existingConfig.database_name !== config.database_name;

    if (needNewPool) {
      // 기존 풀 닫기
      const oldPool = this.pools.get(config.id);
      if (oldPool) await this.closePool(oldPool);

      // 새 풀 생성
      const newPool = await this.createPool(config);
      this.pools.set(config.id, {
        name: config.name,
        type: config.type,
        pool: newPool,
      });
    }

    // connections Map 업데이트 (부분 필드 업데이트 가능)
    this.dbConnectionConfig.set(config.id, { ...existingConfig, ...config });

    // DB에 업데이트
    return await this.updateDBConnection(config, database, dynamicSql);
  }

  // ✅ 연결정보 삭제
  async remove(id: string) {
    const poolObj = this.pools.get(id);
    if (poolObj) {
      await this.closePool(poolObj);
    }
    this.dbConnectionConfig.delete(id);
    this.pools.delete(id);
    const result = await this.deleteDBConnection(id, database, dynamicSql);
    return result;
  }

  // ✅ 등록된 연결정보 목록 조회
  list(): DBConnectionConfig[] {
    return Array.from(this.dbConnectionConfig.values());
  }

  // ✅ 연결 획득
  async getConnection(idOrName: string): Promise<any> {
    let poolObj;

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrName
      );

    if (isUUID) {
      // UUID이면 id 우선
      poolObj = this.pools.get(idOrName);
      if (!poolObj) {
        // 없으면 name으로 검색
        for (const obj of this.pools.values()) {
          if (obj.name === idOrName) {
            poolObj = obj;
            break;
          }
        }
      }
    } else {
      // UUID 아니면 name 우선
      for (const obj of this.pools.values()) {
        if (obj.name === idOrName) {
          poolObj = obj;
          break;
        }
      }
      if (!poolObj) {
        // 없으면 id로 검색
        poolObj = this.pools.get(idOrName);
      }
    }

    if (!poolObj)
      throw new Error(`No pool found for DB ID or Name "${idOrName}"`);

    switch (poolObj.type) {
      case constants.dbType.postgres:
        return {
          type: poolObj.type,
          dbConnection: await poolObj.pool.connect(),
        };
      case constants.dbType.mysql:
        return {
          type: poolObj.type,
          dbConnection: await poolObj.pool.getConnection(),
        };
      case constants.dbType.mssql:
        return { type: poolObj.type, dbConnection: poolObj.pool };
      case constants.dbType.oracle:
        return {
          type: poolObj.type,
          dbConnection: await poolObj.pool.getConnection(),
        };
      default:
        throw new Error(
          `${constants.messages.NOT_SUPPORTED_DB_TYPE}:${poolObj.type}`
        );
    }
  }

  // ✅ 연결 풀 생성
  private async createPool(config: DBConnectionConfig) {
    switch (config.type) {
      case constants.dbType.postgres:
        return new PgPool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database_name,
          ssl: true,
          max: 10,
        });

      case constants.dbType.mysql:
        return mysql.createPool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database_name,
          connectionLimit: 10,
        });

      case constants.dbType.mssql:
        return await mssql.connect({
          user: config.username,
          password: config.password,
          database: config.database_name,
          server: config.host,
          port: config.port,
          pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
          options: { encrypt: false, trustServerCertificate: true },
        });

      case constants.dbType.oracle:
        return await oracledb.createPool({
          user: config.username,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database_name}`,
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
      if (poolObj.type === constants.dbType.mssql) await mssql.close();
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
        case constants.dbType.postgres:
          conn = await pool.connect();
          await conn.query("SELECT 1");
          conn.release();
          break;
        case constants.dbType.mysql:
          conn = await pool.getConnection();
          await conn.query("SELECT 1");
          conn.release();
          break;
        case constants.dbType.mssql:
          await pool.request().query("SELECT 1");
          break;
        case constants.dbType.oracle:
          conn = await pool.getConnection();
          await conn.execute("SELECT 1 FROM DUAL");
          await conn.close();
          break;
      }
      await this.closePool({ name: config.name, type: config.type, pool });
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
      const sql = await dynamicSql.getSQL00(
        "select_TB_COR_WORKFLOW_DBCONNECTIONS",
        1
      );
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
      const sql = await dynamicSql.getSQL00(
        "insert_TB_COR_WORKFLOW_DBCONNECTIONS",
        1
      );
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
      var sql = await dynamicSql.getSQL00(
        "update_TB_COR_WORKFLOW_DBCONNECTIONS",
        1
      );
      var sqlResult = await database.executeSQL(sql, [
        dbConnectionConfig.system_code,
        dbConnectionConfig.id,
        dbConnectionConfig.name,
        dbConnectionConfig.type,
        dbConnectionConfig.host,
        dbConnectionConfig.port,
        dbConnectionConfig.username,
        dbConnectionConfig.password,
        dbConnectionConfig.database_name,
        JSON.stringify(dbConnectionConfig.additional_info || {}),
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
      const sql = await dynamicSql.getSQL00(
        "delete_TB_COR_WORKFLOW_DBCONNECTIONS",
        1
      );
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

  async getDBConnectionPool(
    idOrName: string
  ): Promise<DBConnectionPool | null> {
    // UUID 형식 판별 (v1~v5)
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrName
      );

    let config = null;

    if (isUUID) {
      // ID로 먼저 조회
      config = this.dbConnectionConfig.get(idOrName) ?? null;

      // ID로 못 찾으면 이름으로 재검색
      if (!config) {
        config =
          Array.from(this.dbConnectionConfig.values()).find(
            (c) => c.name === idOrName
          ) ?? null;
      }
    } else {
      // UUID가 아니면 이름으로 검색
      config =
        Array.from(this.dbConnectionConfig.values()).find(
          (c) => c.name === idOrName
        ) ?? null;
    }

    if (!config) return null;

    // ✅ 실제 연결 풀에서 가져오기
    const pool: DBConnectionPool = this.getPool(config.id);

    return pool;
  }

  public getPool(id: string): any {
    const pool: DBConnectionPool | undefined = this.pools.get(id);
    if (!pool || !pool.pool) throw new Error("Pool not found");

    return pool;
  }

  public getDBType(connectionId: string): DBType {
    const info = this.pools.get(connectionId);
    if (!info) throw new Error("DB not found");
    return info.type;
  }
}
