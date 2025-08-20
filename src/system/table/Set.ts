import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseRow, ROW_SCHEMA, RowData } from "../row";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface SetTableData {
  type: "set";
  column: number | string;
  to: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Sets a specific columns value.
 * 
 * For each row, a set of row transformations are performed on it. The resulting
 * value is put into a specific column cell of that row.
 */
export class SetTable implements BaseTable {
  /** The column cell to put the value in. */
  private readonly column: number;
  /** The set of row transformations. */
  private readonly to: BaseRow[];

  /**
   * Create a set operation.
   * @param column The column cell to put the value in.
   * @param to The set of row transformations.
   */
  public constructor(column: number, to: BaseRow[]) {
    this.column = column;
    this.to = to;
  }

  run(table: Table, runner: Runner): Table {
    return table.update(r => {
      const value = BaseRow.runMany(this.to, r, runner, table);
      if (value == null) return null;

      return r.set(this.column, value);
    });
  }

  buildJSON(): SetTableData {
    return { type: "set", column: getExcelFromIndex(this.column), to: this.to.map(o => o.buildJSON()) };
  }

  public static readonly SCHEMA: z.ZodType<BaseTable, SetTableData> = z.strictObject({
    type: z.literal("set"),
    column: ExcelIndexSchema,
    to: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new SetTable(s.column, s.to));
}
