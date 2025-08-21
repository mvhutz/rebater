import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseTable } from ".";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface PercolateTableData {
  type: "percolate";
  columns: (string | number)[];
  matches?: string[];
}

/** ------------------------------------------------------------------------- */

/**
 * Fill in certain cells based on the values above them.
 * 
 * The operation finds all cells with a certain "matching" value, within a
 * certain column. It then looks directly above it, and finds the first cell
 * within the same column that is not a "matching" value. It replaces the cells
 * value with that value.
 */
export class PercolateTable implements BaseTable {
  /** The columns to percolate in. */
  private readonly columns: number[];
  /** The values that are replaced by percolation. */
  private readonly matches: string[];

  /**
   * Create a percolate operation.
   * @param columns The columns to percolate in.
   * @param matches The values that are replaced by percolation.
   */
  public constructor(columns: number[], matches: string[]) {
    this.columns = columns;
    this.matches = matches;
  }

  run(table: Table): Table {
    const previous_maybe = table.get(0);
    if (previous_maybe == null) return table;

    let previous: Row = previous_maybe;
    
    const result = table.update(r => {
      const updated = r.update((v, i) => {
        if (!this.columns.includes(i)) return v;
        if (!this.matches.includes(v)) return v;
        return previous.get(i) ?? v;
      });

      previous = updated;
      return updated;
    })

    return result;
  }

  buildJSON(): PercolateTableData {
    return { type: "percolate", columns: this.columns.map(getExcelFromIndex), matches: this.matches };
  }

  public static readonly SCHEMA: z.ZodType<BaseTable, PercolateTableData> = z.strictObject({
    type: z.literal("percolate"),
    columns: z.array(ExcelIndexSchema),
    matches: z.array(z.string()).default([""])
  }).transform(s => new PercolateTable(s.columns, s.matches));
}
