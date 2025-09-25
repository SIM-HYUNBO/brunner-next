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

export class JsonDatasetManager {
  private data: Record<string, JsonObject[]> = {};
  private columns: Record<string, ColumnSchema[]> = {};

  constructor(initialData?: string | Record<string, JsonObject[]>) {
    if (initialData) this.load(initialData);
  }

  load(input: string | Record<string, JsonObject[]>): void {
    if (typeof input === "string") {
      try {
        this.data = JSON.parse(input);
      } catch {
        throw new Error("Invalid JSON string");
      }
    } else {
      this.data = input;
    }

    // 초기 컬럼 스키마 생성 (모든 컬럼 type = string 기본)
    for (const tableKey of Object.keys(this.data)) {
      const rows = this.data[tableKey];
      if (rows && rows[0]) {
        this.columns[tableKey] = rows[0]
          ? Object.keys(rows[0]).map((name) => ({ name, type: "string" }))
          : [];
      }
    }

    const valid = this.validate();
    if (!valid.valid)
      throw new Error(this.validateMessage() ?? "Invalid JsonDataset");
  }

  getData(): Record<string, JsonObject[]> {
    return this.data;
  }

  getTable(tableKey: string): JsonObject[] | undefined {
    return this.data[tableKey];
  }

  getColumns(tableKey: string): ColumnSchema[] {
    return this.columns[tableKey] ?? [];
  }

  addTable(tableKey: string, rows: JsonObject[] = []): void {
    this.data[tableKey] = rows;
    this.columns[tableKey] = rows[0]
      ? Object.keys(rows[0]).map((name) => ({ name, type: "string" }))
      : [];
  }

  removeTable(tableKey: string): void {
    delete this.data[tableKey];
    delete this.columns[tableKey];
  }

  renameTable(oldName: string, newName: string): void {
    if (!this.data[oldName])
      throw new Error(`Table "${oldName}" does not exist`);
    this.data[newName] = this.data[oldName];
    this.columns[newName] = this.columns[oldName] ?? [];
    delete this.data[oldName];
    delete this.columns[oldName];
  }

  addColumn(tableKey: string, column: ColumnSchema): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    // 각 row에 컬럼 추가
    table.forEach((row) => (row[column.name] = null));
    if (!this.columns[tableKey]) this.columns[tableKey] = [];
    this.columns[tableKey].push(column);
  }

  removeColumn(tableKey: string, columnName: string): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.forEach((row) => delete row[columnName]);
    if (this.columns[tableKey])
      this.columns[tableKey] = this.columns[tableKey].filter(
        (c) => c.name !== columnName
      );
  }

  renameColumn(tableKey: string, oldName: string, newName: string): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.forEach((row) => {
      row[newName] = row[oldName];
      delete row[oldName];
    });
    if (this.columns[tableKey]) {
      const col = this.columns[tableKey].find((c) => c.name === oldName);
      if (col) col.name = newName;
    }
  }

  addRow(tableKey: string, row: JsonObject): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.push(row);
  }

  removeRow(tableKey: string, index: number): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    if (index < 0 || index >= table.length)
      throw new Error(`Row index out of bounds`);
    table.splice(index, 1);
  }

  updateRow(tableKey: string, index: number, newRow: JsonObject): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    if (index < 0 || index >= table.length)
      throw new Error(`Row index out of bounds`);
    table[index] = newRow;
  }

  validate(): JsonDatasetValidationResult {
    const data = this.data;
    if (typeof data !== "object" || data === null) {
      return {
        valid: false,
        error: { tableKey: "", message: "Top-level data is not an object" },
      };
    }
    const tableKeys = Object.keys(data);
    for (const tableKey of tableKeys) {
      const arr = data[tableKey];
      if (!Array.isArray(arr) || arr.length === 0) {
        return {
          valid: false,
          error: { tableKey, message: "Value is not a non-empty array" },
        };
      }
      const firstObj = arr[0];
      if (
        typeof firstObj !== "object" ||
        firstObj === null ||
        Array.isArray(firstObj)
      ) {
        return {
          valid: false,
          error: {
            tableKey,
            arrayIndex: 0,
            message: "Array element is not an object",
          },
        };
      }
      const firstKeys = new Set(Object.keys(firstObj));
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return {
            valid: false,
            error: {
              tableKey,
              arrayIndex: i,
              message: "Array element is not an object",
            },
          };
        }
        const itemKeys = Object.keys(item);
        if (itemKeys.length !== firstKeys.size) {
          return {
            valid: false,
            error: {
              tableKey,
              arrayIndex: i,
              message: "Object keys count mismatch",
            },
          };
        }
        for (const key of itemKeys) {
          if (!firstKeys.has(key)) {
            return {
              valid: false,
              error: {
                tableKey,
                arrayIndex: i,
                message: `Object key mismatch: "${key}"`,
              },
            };
          }
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
