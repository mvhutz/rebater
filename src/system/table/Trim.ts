import { TableInput, TableOperator } from ".";
import { TrimTableData } from "../../shared/transformer/advanced";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Trim rows on the top or bottom of a table.
 */
export class TrimTable implements TableOperator {
  /** How many rows to remove from the top of the table. */
  private readonly top?: number;
  /** How many rows to remove from the bottom of the table. */
  private readonly bottom?: number;

  /**
   * Create a trim operation.
   * @param top How many rows to remove from the top of the table.
   * @param bottom How many rows to remove from the bottom of the table.
   */
  public constructor(input: TrimTableData) {
    this.top = input.top == null ? undefined : input.top;
    this.bottom = input.bottom == null ? undefined : -input.bottom;
  }

  run(input: TableInput): Table {
    return input.table.slice(this.top, this.bottom);
  }
}

