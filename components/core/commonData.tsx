// 컬럼 단위 정의
export interface DatasetColumn {
  key: string; // 항상 있어야 함
  type: "string" | "number" | "boolean" | "object"; // 항상 있어야 함
  bindingType?: "direct" | "ref";
  sourceNodeId?: string; // 바인딩 되어 있을때
}

// -------------------- 타입 정의 --------------------
export interface NodeDataTable {
  table: string;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
}

export interface ActionNodeData {
  label: string;
  actionName: string;
  status: string;
  design: {
    inputs: NodeDataTable[];
    outputs: NodeDataTable[];
    scriptContents: string;
    scriptTimeoutMs: number;
  };
  run: {
    inputs: NodeDataTable[];
    outputs: NodeDataTable[];
  };
}

export interface ConditionEdgeData {
  condition?: string;
}

export type JsonObject = { [key: string]: any };

export type DesignColumn = {
  name: string;
  type: "string" | "number" | "boolean" | "object";
};

export type DesignedDataset = Record<string, DesignColumn[]>;

export type BrunnerDataset = Record<string, Record<string, any>[]>;
