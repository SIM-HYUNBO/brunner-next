export interface DatasetColumn {
  key: string; // 항상 있어야 함
  type: "string" | "number" | "boolean" | "object"; // 항상 있어야 함
  bindingType?: "direct" | "ref";
  sourceNodeId?: string; // 바인딩 되어 있을때
}

export interface DataTable {
  table: string;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
}
