export type JsonObject = { [key: string]: any };

export interface ColumnSchema {
  name: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "null"
    | "date"
    | "datetime";
}

export interface JsonDatasetValidationResult {
  valid: boolean;
  error?: {
    tableKey: string;
    arrayIndex?: number;
    message: string;
  };
}

import type {
  NodeDataTable,
  DatasetColumn,
} from "@/components/workflow/actionRegistry";

export class JsonDatasetManager {
  private data: Record<string, JsonObject[]> = {};
  private columns: Record<string, ColumnSchema[]> = {};

  constructor(initialData?: Record<string, JsonObject[]> | string) {
    if (initialData) this.load(initialData);
  }

  // ---------------- Table / Column ----------------
  addTable(tableKey: string, rows: JsonObject[] = []) {
    this.data[tableKey] = rows;
    this.columns[tableKey] = rows[0]
      ? Object.keys(rows[0]).map((name) => ({ name, type: "string" }))
      : [];
  }

  removeTable(tableKey: string) {
    delete this.data[tableKey];
    delete this.columns[tableKey];
  }

  getData(): Record<string, JsonObject[]> {
    return this.data;
  }

  getTable(tableKey: string): JsonObject[] {
    return this.data[tableKey] ?? [];
  }

  getColumns(tableKey: string): ColumnSchema[] {
    return this.columns[tableKey] ?? [];
  }

  addColumn(tableKey: string, column: ColumnSchema) {
    if (!this.data[tableKey]) this.addTable(tableKey);
    (this.data[tableKey] ?? []).forEach((row) => (row[column.name] = null));
    if (!this.columns[tableKey]) this.columns[tableKey] = [];
    this.columns[tableKey]?.push(column);
  }

  removeColumn(tableKey: string, columnName: string) {
    (this.data[tableKey] ?? []).forEach((row) => delete row[columnName]);
    if (this.columns[tableKey]) {
      this.columns[tableKey] = (this.columns[tableKey] ?? []).filter(
        (c) => c.name !== columnName
      );
    }
  }

  addRow(tableKey: string, row: JsonObject) {
    if (!this.data[tableKey]) this.addTable(tableKey);
    this.data[tableKey]?.push(row);
  }

  removeRow(tableKey: string, index: number) {
    if (!this.data[tableKey]) return;
    if (index >= 0 && index < (this.data[tableKey]?.length ?? 0)) {
      this.data[tableKey]?.splice(index, 1);
    }
  }

  updateRow(tableKey: string, index: number, newRow: JsonObject) {
    if (!this.data[tableKey]) return;
    if (index >= 0 && index < (this.data[tableKey]?.length ?? 0)) {
      this.data[tableKey]![index] = newRow;
    }
  }

  setField(nodeId: string, table: string, value: JsonObject[]) {
    const key = nodeId + "_" + table;
    if (!this.data[key]) this.addTable(key, value);
    else this.data[key] = value;
  }

  getField(nodeId: string, table: string): JsonObject[] {
    return this.data[nodeId + "_" + table] ?? [];
  }

  // ---------------- NodeDatasetField CRUD ----------------
  initNode(nodeId: string, fields: NodeDataTable[]) {
    for (const field of fields) {
      this.addTable(nodeId + "_" + field.table, field.value ?? []);
    }
  }

  getNodeDataset(nodeId: string): NodeDataTable[] {
    const result: NodeDataTable[] = [];

    for (const tableKey of Object.keys(this.data)) {
      if (tableKey.startsWith(`${nodeId}_`)) {
        const tableData = this.data[tableKey] ?? [];

        const sampleRow = tableData.find(
          (row) => row && typeof row === "object"
        );

        const columns: DatasetColumn[] = sampleRow
          ? Object.keys(sampleRow).map((key) => {
              const rawType = typeof sampleRow[key];

              // 'DatasetColumn["type"]'에 맞게 변환
              const allowedTypes: DatasetColumn["type"][] = [
                "string",
                "number",
                "boolean",
                "object",
              ];
              const type: DatasetColumn["type"] = allowedTypes.includes(
                rawType as any
              )
                ? (rawType as DatasetColumn["type"])
                : "object"; // fallback 타입

              return { key, type };
            })
          : [];

        result.push({
          table: tableKey.replace(`${nodeId}_`, ""),
          value: tableData,
          columns,
        });
      }
    }

    return result;
  }

  resetNode(nodeId: string, fields: NodeDataTable[]) {
    for (const tableKey of Object.keys(this.data)) {
      if (tableKey.startsWith(nodeId + "_")) delete this.data[tableKey];
    }
    this.initNode(nodeId, fields);
  }

  // ---------------- Load / 초기화 ----------------
  load(input: string | Record<string, JsonObject[]>) {
    if (typeof input === "string") {
      try {
        this.data = JSON.parse(input);
      } catch {
        throw new Error("Invalid JSON string");
      }
    } else {
      this.data = input;
    }

    for (const tableKey of Object.keys(this.data)) {
      const rows = this.data[tableKey] ?? [];
      this.columns[tableKey] = rows[0]
        ? Object.keys(rows[0]).map((name) => ({ name, type: "string" }))
        : [];
    }

    const valid = this.validate();
    if (!valid.valid)
      throw new Error(this.validateMessage() ?? "Invalid JsonDataset");
  }

  // ---------------- Validation ----------------
  validate(): JsonDatasetValidationResult {
    const data = this.data;
    if (typeof data !== "object" || data === null) {
      return {
        valid: false,
        error: { tableKey: "", message: "Top-level data is not an object" },
      };
    }
    for (const tableKey of Object.keys(data)) {
      const arr = data[tableKey] ?? [];
      if (!Array.isArray(arr))
        return {
          valid: false,
          error: { tableKey, message: "Value is not an array" },
        };
      for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== "object" || arr[i] === null) {
          return {
            valid: false,
            error: {
              tableKey,
              arrayIndex: i,
              message: "Array element is not object",
            },
          };
        }
      }
    }
    return { valid: true };
  }

  validateMessage(): string | null {
    const result = this.validate();
    if (result.valid) return null;
    const err = result.error!;
    const idxPart =
      err.arrayIndex !== undefined
        ? ` 배열 ${err.arrayIndex + 1}번째 객체`
        : "";
    const tablePart = err.tableKey ? `${err.tableKey}${idxPart}` : "데이터";
    return `${tablePart}: ${err.message}`;
  }
}
