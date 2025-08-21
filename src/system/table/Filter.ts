import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from "../row";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface FilterTableData {
  type: "filter";
  criteria: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Filters rows, based a certain criteria.
 * 
 * For each row in the table, a set of row transformations are run. If the
 * resulting value is truthy, the row is kept.
 */
export class FilterTable implements BaseTable {
  /** The criteria to check. */
  private readonly criteria: BaseRow[];

  /**
   * Create a filter operation.
   * @param criteria The criteria to check.
   */
  public constructor(criteria: BaseRow[]) {
    this.criteria = criteria;
  }

  run(table: Table, runner: Runner): Table {
    return table.filter(row => {
      const value = BaseRow.runMany(this.criteria, row, runner, table);
      return value === "true";
    });
  }

  buildJSON(): FilterTableData {
    return { type: "filter", criteria: this.criteria.map(o => o.buildJSON()) };
  }

  public static readonly SCHEMA: z.ZodType<BaseTable, FilterTableData> = z.strictObject({
    type: z.literal("filter"),
    criteria: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new FilterTable(s.criteria));
}