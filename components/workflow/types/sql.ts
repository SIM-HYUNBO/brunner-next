// SQL 노드에서 사용할 타입 정의

export interface SqlParam {
  name?: string;
  type?: "string" | "number" | "boolean" | "object"; // optional
  binding?: string;
}

export interface SqlNodeData {
  nodeType?: "sql" | string; // 노드 유형
  sql?: string; // SQL문
  params?: SqlParam[]; // 파라미터 목록
  connectionId?: string; // 연결된 DB ID
  resultVarName?: string; // 결과를 저장할 변수명
  maxRows?: number; // 최대 조회 행 수
}
