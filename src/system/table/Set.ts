import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, makeTable } from "../util";
import { BaseRow, ROW_SCHEMA, runMany } from "../row";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

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

  async run(table: Table, runner: Runner): Promise<Table> {
    const new_rows = [];
    for (const row of table.data) {
      const value = await runMany(this.to, row, runner);
      if (value != null) {
        row.data[this.column] = value;
        new_rows.push(row.data);
      }
    }

    return makeTable(new_rows, table.path);
  }

  build(from: XMLElement): void {
    const parent = from.element("set", {
      column: getExcelFromIndex(this.column),
    });

    for (const t of this.to) {
      t.build(parent);
    }
  }
}
