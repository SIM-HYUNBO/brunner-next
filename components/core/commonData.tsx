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

    // Script Node
    scriptContents?: string;
    scriptTimeoutMs?: number;

    // Branch Node
    mode?: string;
    condition?: string;
    loopStartValue?: any;
    loopStepValue?: any;
    loopLimitValue?: any;

    // Sql Node

    sqlStmt?: string;
    sqlParams?: any[];
    dbConnectionId?: string;
    outputTableName?: string;

    // Call Node
    targetWorkflowId?: string;
    targetWorkflowName?: string;
  };
  run: {
    inputs: NodeDataTable[];
    outputs: NodeDataTable[];
  };
}

export interface ConditionEdgeData {
  condition?: string;
}
