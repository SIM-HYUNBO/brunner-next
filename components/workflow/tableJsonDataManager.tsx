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
  private data: Record<string, JsonObject[]>;

  constructor(initialData?: string | Record<string, JsonObject[]>) {
    this.data = {};
    if (initialData) this.load(initialData);
  }

  /** ---------- 데이터 로드 ---------- */
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

  /** ---------- CRUD ---------- */

  getTable(tableKey: string): JsonObject[] | undefined { return this.data[tableKey]; }

  addTable(tableKey: string, rows: JsonObject[] = []): void {
    if (this.data[tableKey]) throw new Error(`Table "${tableKey}" already exists`);
    this.data[tableKey] = rows;
  }

  removeTable(tableKey: string): void { delete this.data[tableKey]; }

  addRow(tableKey: string, row: JsonObject): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.push(row);
  }

  updateRow(tableKey: string, rowIndex: number, newRow: JsonObject): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    if (rowIndex < 0 || rowIndex >= table.length) throw new Error(`Row index out of bounds`);
    table[rowIndex] = newRow;
  }

  removeRow(tableKey: string, rowIndex: number): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    if (rowIndex < 0 || rowIndex >= table.length) throw new Error(`Row index out of bounds`);
    table.splice(rowIndex, 1);
  }

  getData(): Record<string, JsonObject[]> { return this.data; }

  /** ---------- 유효성 검사 ---------- */
  validate(): TableJsonValidationResult {
    const data = this.data;
    if (typeof data !== "object" || data === null) {
      return { valid: false, error: { tableKey: "", message: "Top-level data is not an object" } };
    }
    const tableKeys = Object.keys(data);

    for (let t = 0; t < tableKeys.length; t++) {
      const tableKey = tableKeys[t];
      const arr = data[tableKey];

      if (!Array.isArray(arr) || arr.length === 0) {
        return { valid: false, error: { tableKey, message: "Value is not a non-empty array" } };
      }

      const firstObj = arr[0];
      if (typeof firstObj !== "object" || firstObj === null || Array.isArray(firstObj)) {
        return { valid: false, error: { tableKey, arrayIndex: 0, message: "Array element is not an object" } };
      }

      const firstKeys = new Set(Object.keys(firstObj));

      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return { valid: false, error: { tableKey, arrayIndex: i, message: "Array element is not an object" } };
        }

        const itemKeys = Object.keys(item);
        if (itemKeys.length !== firstKeys.size) {
          return { valid: false, error: { tableKey, arrayIndex: i, message: "Object keys count mismatch" } };
        }

        for (let k = 0; k < itemKeys.length; k++) {
          if (!firstKeys.has(itemKeys[k])) {
            return { valid: false, error: { tableKey, arrayIndex: i, message: `Object key mismatch: missing or extra key "${itemKeys[k]}"` } };
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
    const idxPart = err.arrayIndex !== undefined ? ` 배열 ${err.arrayIndex + 1}번째 객체` : "";
    const tablePart = err.tableKey ? `${err.tableKey}${idxPart}` : "데이터";
    return `${tablePart}: ${err.message}`;
  }

  /** ---------- 고급 기능 ---------- */
  filterRows(tableKey: string, predicate: (row: JsonObject) => boolean): JsonObject[] {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    return table.filter(predicate);
  }

  sortRows(tableKey: string, compareFn: (a: JsonObject, b: JsonObject) => number): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    table.sort(compareFn);
  }

  batchUpdateRows(tableKey: string, updateFn: (row: JsonObject, index: number) => JsonObject): void {
    const table = this.data[tableKey];
    if (!table) throw new Error(`Table "${tableKey}" does not exist`);
    for (let i = 0; i < table.length; i++) {
      table[i] = updateFn(table[i], i);
    }
  }

  cloneTable(sourceTableKey: string, targetTableKey: string): void {
    const table = this.data[sourceTableKey];
    if (!table) throw new Error(`Table "${sourceTableKey}" does not exist`);
    this.data[targetTableKey] = table.map(row => ({ ...row }));
  }

  mergeTable(sourceTableKey: string, targetTableKey: string): void {
    const src = this.data[sourceTableKey];
    const tgt = this.data[targetTableKey];
    if (!src) throw new Error(`Table "${sourceTableKey}" does not exist`);
    if (!tgt) throw new Error(`Table "${targetTableKey}" does not exist`);
    tgt.push(...src.map(row => ({ ...row })));
  }
}
