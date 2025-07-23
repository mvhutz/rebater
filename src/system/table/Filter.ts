import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from "../row";
import { State } from "../information/State";
import { rewire } from "../util";
import { BaseTable } from ".";

/** ------------------------------------------------------------------------- */

export class FilterTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("filter"),
    criteria: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new FilterTable(s.criteria));

  private readonly criteria: BaseRow[];

  public constructor(criteria: BaseRow[]) {
    this.criteria = criteria;
  }

  async run(table: Table, state: State): Promise<Table> {
    const rows = new Array<Row>();
    for (const row of table.data) {
      const value = await runMany(this.criteria, row, state);
      if (value === "true") rows.push(row);
    }

    return rewire({ ...table, data: rows });
  }
}