import { z } from "zod/v4";
import { ExcelIndexSchema } from "../util";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export class ColumnRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("column"),
    index: ExcelIndexSchema
  }).transform(s => new ColumnRow(s.index));

  private readonly index: number;

  public constructor(index: number) {
    this.index = index;
  }

  async run(_v: string, row: Row): Promise<string> {
    return row.data[this.index];
  }
}
