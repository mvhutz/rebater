import { TableInput, TableOperator } from ".";
import { Row, Table } from "../information/Table";
import { PercolateTableData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Fill in certain cells based on the values above them.
 * 
 * The operation finds all cells with a certain "matching" value, within a
 * certain column. It then looks directly above it, and finds the first cell
 * within the same column that is not a "matching" value. It replaces the cells
 * value with that value.
 */
export class PercolateTable implements TableOperator {
  /** The columns to percolate in. */
  private readonly columns: number[];
  /** The values that are replaced by percolation. */
  private readonly matches: string[];

  /**
   * Create a percolate operation.
   * @param columns The columns to percolate in.
   * @param matches The values that are replaced by percolation.
   */
  public constructor(input: PercolateTableData) {
    this.columns = input.columns;
    this.matches = input.matches;
  }

  run(input: TableInput): Table {
    const previous_maybe = input.table.get(0);
    if (previous_maybe == null) return input.table;

    let previous: Row = previous_maybe;
    
    const result = input.table.update(r => {
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
}
