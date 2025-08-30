import { RowInput, RowOperator } from ".";
import { SumRowData } from "../../shared/transformer/advanced";
import { Table } from "../information/Table";
import assert from "assert";

/** ------------------------------------------------------------------------- */

/**
 * Find the combined sum of a specific column of the table that the row is from.
 */
export class SumRow implements RowOperator {
  /** The column to sum. */
  private readonly column: number;

  /** A cache of any previous sums, to meet performance needs. */
  private cache = new WeakMap<Table, Map<number, number>>();

  /**
   * Create a sum operation.
   * @param column The column to be summed.
   */
  public constructor(input: SumRowData) {
    this.column = input.column;
  }

  run(input: RowInput): string {
    // Get table sums.
    let cached_table = this.cache.get(input.table);
    if (cached_table == null) {
      this.cache.set(input.table, cached_table = new Map());
    }

    // Get sum.
    const cached_sum = cached_table.get(this.column);
    if (cached_sum != null) return cached_sum.toString();

    // Make sum.
    let sum = 0;
    for (const _row of input.table.split()) {
      const value = parseFloat(_row.get(this.column) ?? "");
      assert.ok(!isNaN(value), `Cannot add value '${_row.get(this.column)}' to sum; it is not a number!`);

      sum += value;
    }

    // Remember sum.
    cached_table.set(this.column, sum);
    return sum.toString();
  }
}
