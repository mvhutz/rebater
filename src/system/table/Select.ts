import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { SelectTableData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Filters rows based on their value in a specific column.
 * 
 * For each row in a table, the operation collects the row if the specified
 * column in that row equals a specific value.
 * 
 * If the user chooses to `"drop"` these rows, there will be deleted, and the
 * remaining rows returned.
 * 
 * If the user chooses to `"keep"` these rows, they will be returned instead,
 * ignoring all other rows.
 */
export class SelectTable implements TableOperator {
  /** The colunm to check. */
  private readonly column: number;
  /** The value to match against. */
  private readonly is: string;
  /** Whether to keep any matching rows, or delete them. */
  private readonly action: "drop" | "keep";

  /**
   * Create a select operation.
   * @param column The colunm to check.
   * @param action The value to match against.
   * @param is Whether to keep any matching rows, or delete them.
   */
  public constructor(input: SelectTableData) {
    this.column = input.column;
    this.action = input.action;
    this.is = input.is;
  }

  run(input: TableInput): Table {
    return input.table.filter(r => {
      return (this.is === r.get(this.column)) === (this.action === "keep");
    });
  }
}
