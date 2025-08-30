import { RowInput, RowOperator } from ".";
import assert from "node:assert";
import { ColumnRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Extract a specific column value from a row.
 */
export class ColumnRow implements RowOperator {
  /** The index of the column value to extract. */
  private readonly index: number;

  /**
   * Create a column operation.
   * @param index The index of the column value to extract.
   */
  public constructor(input: ColumnRowData) {
    this.index = input.index;
  }

  run(input: RowInput): string {
    const value = input.row.get(this.index);
    assert.ok(value != null, `There is no data in column '${this.index + 1}'.`);

    return value;
  }
}
