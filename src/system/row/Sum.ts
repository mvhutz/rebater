import { z } from "zod/v4";
import { ExcelIndexSchema } from "../util";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export class SumRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("sum"),
    column: ExcelIndexSchema,
  }).transform(s => new SumRow(s.column));

  private readonly column: number;
  private static cache = new WeakMap<Table, Map<number, number>>();

  public constructor(column: number) {
    this.column = column;
  }

  async run(_value: string, row: Row): Promise<string> {
    let cached_table = SumRow.cache.get(row.table);
    if (cached_table == null) {
      SumRow.cache.set(row.table, cached_table = new Map());
    }

    const cached_sum = cached_table.get(this.column);
    if (cached_sum != null) return cached_sum.toString();

    let sum = 0;
    for (const _row of row.table.data) {
      sum += parseFloat(_row.data[this.column]);
    }

    cached_table.set(this.column, sum);
    return sum.toString();
  }
}
