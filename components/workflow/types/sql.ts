// SQL 노드에서 사용할 타입 정의

export interface SqlParam {
  name?: string;
  type?: "string" | "number" | "boolean" | "object"; // optional
  binding?: string;
}

export interface SqlNodeData {
  dbConnectionId?: string; // 연결된 DB ID
  sqlStmt?: string; // SQL문
  sqlParams?: SqlParam[]; // 파라미터 목록
  maxRows?: number | undefined; // 최대 조회 행 수, undefined나 0이면 무제한
}
