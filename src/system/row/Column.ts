import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseRow } from ".";
import assert from "node:assert";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface ColumnRowData {
  type: "column";
  index: number | string;
}

/** ------------------------------------------------------------------------- */

/**
 * Extract a specific column value from a row.
 */
export class ColumnRow implements BaseRow {
  /** The index of the column value to extract. */
  private readonly index: number;

  /**
   * Create a column operation.
   * @param index The index of the column value to extract.
   */
  public constructor(index: number) {
    this.index = index;
  }

  run(_v: string, row: Row): Maybe<string> {
    const value = row.get(this.index);
    assert.ok(value != null, `Cannot pull column ${this.index + 1} from row.`);

    return value;
  }

  buildJSON(): ColumnRowData {
    return { type: "column", index: getExcelFromIndex(this.index) };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, ColumnRowData> = z.strictObject({
    type: z.literal("column"),
    index: ExcelIndexSchema
  }).transform(s => new ColumnRow(s.index));
}
