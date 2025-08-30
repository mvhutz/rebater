import { TableInput, TableOperator } from ".";
import assert from "assert";
import { Row, Table } from "../information/Table";
import { CoalesceTableData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Combines specific rows.
 * 
 * This operation sorts all rows in the table into buckets, based on the values
 * of certain `match` columns in the rows.
 * 
 * Then, for each bucket, it takes the rows inside, and collects the sums of
 * certain `combine` columns, and creates a "super" column which contains these
 * sums.
 * 
 * Then, it collects these "super" rows, and returns them as a table.
 */
export class CoalesceTable implements TableOperator {
  /** The columns which the rows should be matched on. */
  private readonly match: number[];
  /** The columns which should be summed, when within the buckets. */
  private readonly combine: number[];

  /**
   * Create a coalesce operation.
   * @param match The columns which the rows should be matched on.
   * @param combine The columns which should be summed, when within the buckets.
   */
  public constructor(input: CoalesceTableData) {
    this.match = input.match;
    this.combine = input.combine;
  }

  /**
   * Create a hash s.t. any other row which should be in the same bucket, has
   * the same hash.
   * @param row The row to be hashed.
   * @returns The hash.
   */
  getHash(row: Row) {
    const array = this.match.map(m => row.get(m));
    return JSON.stringify(array);
  }

  /**
   * Combine a set of rows.
   * @param rows The rows to combine.
   * @returns A single row, containing all summed columns, and otherwise, the
   * column values of the first row.
   */
  combineRows(table: Table): Maybe<Row> {
    const sums = new Map<number, number>();
    const first = table.get(0);

    // If no rows, cannot coalesce.
    if (first == null) return null;

    // Extract sums.
    for (const index of this.combine) {
      for (const row of table.split()) {
        const sum = sums.get(index) ?? 0;
        const current = parseInt(row.get(index) ?? "null");
        assert.ok(!isNaN(current), `Value "${current}" is not a number!`);

        sums.set(index, current + sum);
      }
    }

    // Build row.
    const row = first.update((v, i) => {
      const sum = sums.get(i);
      return (sum ?? v).toString();
    })

    return row;
  }

  run(input: TableInput): Table {
    // Create the buckets.
    const buckets = input.table.divide(row => this.getHash(row));

    // Combine the buckets.
    const coalesced = buckets
      .values()
      .toArray()
      .map(t => this.combineRows(t))
      .filter(r => r != null);
  
    return Table.join(coalesced, input.table.info);
  }
}