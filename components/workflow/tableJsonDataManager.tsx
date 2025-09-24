export type JsonObject = { [key: string]: any };

export interface TableJsonValidationResult {
  valid: boolean;
  error?: {
    tableKey: string;
    arrayIndex?: number;
    message: string;
  };
}

export class TableJsonDataManager {
  private data: Record<string, JsonObject[]> = {};

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
    const valid = this.validate();
    if (!valid.valid) {
      throw new Error(this.validateMessage() ?? "Invalid TableJsonData");
    }
  }

  getData(): Record<string, JsonObject[]> {
    return this.data;
  }

  getTable(tableKey: string): JsonObject[] | undefined {
    return this.data[tableKey];
  }

  addTable(tableKey: string, rows: JsonObject[] = []): void {
    if (this.data[tableKey])
      throw new Error(`Table "${tableKey}" already exists`);
    this.data[tableKey] = rows;
  }

  removeTable(tableKey: string): void {
    delete this.data[tableKey];
  }

  renameTable(oldName: string, newName: string): void {
    if (!this.data[oldName])
      throw new Error(`Table "${oldName}" does not exist`);
    this.data[newName] = this.data[oldName];
    delete this.data[oldName];
  }

  addColumn(tableKey: string, columnName: string): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.forEach((row) => (row[columnName] = ""));
  }

  removeColumn(tableKey: string, columnName: string): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.forEach((row) => delete row[columnName]);
  }

  renameColumn(tableKey: string, oldName: string, newName: string): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.forEach((row) => {
      row[newName] = row[oldName];
      delete row[oldName];
    });
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

  validate(): TableJsonValidationResult {
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
