// src/engine/db/DBConnectionManager.ts
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
  private connections: Map<string, DBConnectionConfig> = new Map();
  private pools: Map<string, DBConnectionPool> = new Map();

  // ✅ 연결정보 등록
  async register(config: DBConnectionConfig) {
    if (this.connections.has(config.id)) {
      throw new Error(`DB connection with ID ${config.id} already exists`);
    }

    const pool = await this.createPool(config);
    this.connections.set(config.id, config);
    this.pools.set(config.id, { type: config.type, pool });
  }

  // ✅ 연결정보 수정
  async update(config: DBConnectionConfig) {
    if (!this.connections.has(config.id)) {
      throw new Error(`DB connection with ID ${config.id} not found`);
    }

    await this.remove(config.id);
    await this.register(config);
  }

  // ✅ 연결정보 삭제
  async remove(id: string) {
    const poolObj = this.pools.get(id);
    if (poolObj) {
      await this.closePool(poolObj);
    }
    this.connections.delete(id);
    this.pools.delete(id);
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
}

// ✅ 싱글톤 인스턴스
export const dbConnectionManager = new DBConnectionManager();
