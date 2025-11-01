export type JsonObject = { [key: string]: any };

export interface ColumnSchema {
  name: string;
  type: JsonColumnType;
}

export interface JsonDatasetValidationResult {
  valid: boolean;
  error?: {
    tableKey: string;
    arrayIndex?: number;
    message: string;
  };
}

import type { DataTable, DatasetColumn } from "@/components/core/commonData";
import type { JsonColumnType } from "./jsonDatasetEditorModal";

export class JsonDatasetManager {
  private data: Record<string, JsonObject[]> = {};
  private columns: Record<string, ColumnSchema[]> = {};

  constructor(initialData?: Record<string, JsonObject[]> | string) {
    if (initialData) this.load(initialData);
  }

  // ---------------- Table / Column ----------------
  addTable(tableKey: string, rows: JsonObject[] = []) {
    this.data[tableKey] = rows;

    if (rows.length > 0 && rows[0] != null) {
      const firstRow = rows[0] as Record<string, any>; // 타입 단언
      this.columns[tableKey] = Object.keys(firstRow).map((name) => ({
        name,
        type: this.inferType(firstRow[name]),
      }));
    } else {
      this.columns[tableKey] = [];
    }
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

  // 테이블과 컬럼 배열 존재를 보장
  private ensureTable(tableKey: string): Record<string, any>[] {
    if (!this.data[tableKey]) this.data[tableKey] = [];
    if (!this.columns[tableKey]) this.columns[tableKey] = [];
    return this.data[tableKey]!; // !를 붙여서 undefined 아님을 단언
  }

  // 컬럼 추가
  addColumn(tableKey: string, column: ColumnSchema): void {
    const tableRows = this.ensureTable(tableKey);

    // ✅ 1️⃣ 행이 하나도 없으면 기본 행 1개 생성
    if (tableRows.length === 0) {
      const newRow: Record<string, any> = {};
      newRow[column.name] = this.getDefaultValue(column.type); // 새 컬럼 기본값 설정
      this.data[tableKey]!.push(newRow);
    } else {
      // ✅ 2️⃣ 모든 행에 새 컬럼 추가
      for (const row of tableRows) {
        (row as Record<string, any>)[column.name] = this.getDefaultValue(
          column.type
        );
      }
    }

    // ✅ 3️⃣ 컬럼 배열 보장 후 추가
    const cols = this.ensureColumns(tableKey);
    cols.push(column);
  }
  private getDefaultValue(type: ColumnSchema["type"]) {
    switch (type) {
      case "number":
        return 0;
      case "boolean":
        return false;
      case "string":
      default:
        return "";
    }
  }
  // 컬럼 제거
  removeColumn(tableKey: string, columnName: string) {
    const tableRows = this.data[tableKey];
    if (tableRows) {
      for (const row of tableRows) {
        delete (row as Record<string, any>)[columnName];
      }
    }

    const columns = this.ensureColumns(tableKey);
    this.columns[tableKey] = columns.filter((c) => c.name !== columnName);
  }

  private ensureColumns(tableKey: string): ColumnSchema[] {
    if (!this.columns[tableKey]) this.columns[tableKey] = [];
    return this.columns[tableKey]!; // non-null 단언
  }

  addRow(tableKey: string, row: JsonObject) {
    if (!this.data[tableKey]) this.addTable(tableKey);
    this.data[tableKey]!.push(row);
  }

  removeRow(tableKey: string, index: number) {
    const tableRows = this.data[tableKey];
    if (!tableRows) return;

    if (index >= 0 && index < tableRows.length) {
      tableRows.splice(index, 1);
    }
  }

  updateRow(tableKey: string, index: number, newRow: JsonObject) {
    const tableRows = this.data[tableKey];
    if (!tableRows) return;

    if (index >= 0 && index < tableRows.length) {
      tableRows[index] = newRow;
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
  initNode(nodeId: string, fields: DataTable[]) {
    for (const field of fields) {
      this.addTable(nodeId + "_" + field.table, field.rows ?? []);
    }
  }

  getNodeDataset(nodeId: string): DataTable[] {
    const result: DataTable[] = [];

    for (const tableKey of Object.keys(this.data)) {
      if (!tableKey.startsWith(`${nodeId}_`)) continue;

      const tableData = this.data[tableKey] ?? [];
      const sampleRow = tableData.find((row) => row && typeof row === "object");

      const columns: DatasetColumn[] = sampleRow
        ? Object.keys(sampleRow).map((key) => {
            const rawType = typeof sampleRow[key];
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
              : "object";

            return { key, type };
          })
        : [];

      result.push({
        table: tableKey.replace(`${nodeId}_`, ""),
        rows: tableData,
        columns,
      });
    }

    return result;
  }

  resetNode(nodeId: string, fields: DataTable[]) {
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

      if (rows.length > 0 && rows[0] != null) {
        const firstRow = rows[0] as Record<string, any>; // 명확히 타입 단언
        this.columns[tableKey] = Object.keys(firstRow).map((name) => ({
          name,
          type: this.inferType(firstRow[name]),
        }));
      } else {
        this.columns[tableKey] = [];
      }
    }
  }
  // ---------------- Type 추론 ----------------
  private inferType(value: any): ColumnSchema["type"] {
    switch (typeof value) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      default:
        return "string";
    }
  }

  // ---------------- Validation ----------------
  validate(): JsonDatasetValidationResult {
    if (typeof this.data !== "object" || this.data === null) {
      return {
        valid: false,
        error: { tableKey: "", message: "Top-level data is not an object" },
      };
    }

    for (const tableKey of Object.keys(this.data)) {
      const arr = this.data[tableKey] ?? [];
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
