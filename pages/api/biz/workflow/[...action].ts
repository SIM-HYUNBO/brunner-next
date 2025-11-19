import * as constants from "@/components/core/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import mssql from "mssql";
import mysql2 from "mysql2/promise";
import { Client } from "pg";
import oracledb from "oracledb";

interface DBConnectionInfo {
  id: string;
  name: string;
  type: "postgres" | "mysql" | "mssql" | "oracle";
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// 메모리 DB (임시)
let connections: DBConnectionInfo[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [action, id] = req.query.action as string[];

  // 테스트
  if (action === "test" && req.method === constants.httpMethod.POST) {
    const conn: DBConnectionInfo = req.body;
    try {
      if (conn.type === constants.dbType.postgres) {
        const client = new Client(conn);
        await client.connect();
        await client.end();
      } else if (conn.type === constants.dbType.mysql) {
        const connection = await mysql2.createConnection(conn);
        await connection.end();
      } else if (conn.type === constants.dbType.mssql) {
        const pool = await mssql.connect({
          user: conn.user,
          password: conn.password,
          server: conn.host,
          database: conn.database,
          port: conn.port,
          options: { encrypt: false },
        });
        await pool.close();
      } else if (conn.type === constants.dbType.oracle) {
        const connection = await oracledb.getConnection({
          user: conn.user,
          password: conn.password,
          connectString: `${conn.host}:${conn.port}/${conn.database}`,
        });
        await connection.close();
      } else {
        return res.status(400).json({
          success: false,
          message: constants.messages.NOT_SUPPORTED_DB_TYPE,
        });
      }
      return res
        .status(200)
        .json({ success: true, message: constants.messages.SUCCESS_CONNECTED });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
    return;
  }

  // id가 있는 경우 (PUT / DELETE)
  if (id) {
    const idx = connections.findIndex((c) => c.id === id);
    if (idx === -1)
      return res.status(404).json({ message: "DB 연결정보 없음" });

    if (req.method === constants.httpMethod.PUT) {
      connections[idx] = { ...connections[idx], ...req.body };
      return res.status(200).json(connections[idx]);
    }
    if (req.method === constants.httpMethod.DELETE) {
      connections.splice(idx, 1);
      return res.status(204).end();
    }
    return res.status(405).json({ message: "Method not allowed" });
  }

  // id 없고 action 없으면 (GET / POST)
  if (!action) {
    if (req.method === constants.httpMethod.GET)
      return res.status(200).json(connections);
    if (req.method === constants.httpMethod.POST) {
      const data: DBConnectionInfo = { ...req.body, id: uuidv4() };
      connections.push(data);
      return res.status(201).json(data);
    }
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(404).json({ message: "잘못된 요청" });
}
