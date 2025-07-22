import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../util";
import { ROW_SCHEMA, runMany } from "../row";
import { State } from "../information/State";
import { BaseTable } from ".";
import { BaseRow } from "../row/base";

/** ------------------------------------------------------------------------- */

export class SetTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("set"),
    column: ExcelIndexSchema,
    to: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new SetTable(s.column, s.to));

  private readonly column: number;
  private readonly to: BaseRow[];

  public constructor(column: number, to: BaseRow[]) {
    this.column = column;
    this.to = to;
  }

  async run(table: Table, state: State): Promise<Table> {
    for (const row of table.data) {
      const value = await runMany(this.to, row, state);
      row.data[this.column] = value;
    }

    return rewire(table);
  }
}
