import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { HeaderTableData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Alter the available columns, based on the values within the first row
 * (header).
 * 
 * If the user acts to `"keep"` the chosen `names`, then:
 * - The operations goes through the list of names, sequentially.
 * - For each name, it finds the first column s.t. its first row matches the
 *   name. It places the entire column into a resulting table.
 * - If no column is found, it does not place a column.
 * - After all columns are found, they are combined (in the order that the names
 *   where specified), and returned as a table.
 * 
 * If the user acts to `"drop"` the chosen `name`, then:
 * - The operations goes through the list of names, sequentially.
 * - For each name, find all columns which contain that name in the first row.
 * - Delete those columns.
 * - Return the resulting table.
 */
export class HeaderTable implements TableOperator {
  /** The names of the headers to search for. */
  private readonly names: string[];
  /** Whether to keep the found columns, or drop them. */
  private readonly action: "drop" | "keep";

  /**
   * Create a header operation.
   * @param names The names of the headers to search for.
   * @param action Whether to keep the found columns, or drop them.
   */
  public constructor(input: HeaderTableData) {
    this.names = input.names;
    this.action = input.action;
  }

  run(input: TableInput): Table {
    const rotated = input.table.transpose();

    if (this.action === "drop") {
      const columns = rotated.filter(c => !this.names.includes(c.get(0) ?? ""));
      return columns.transpose();
    }
    
    else {
      const columns = this.names
        .map(n => rotated.split().find(c => c.get(0) === n))
        .filter(c => c != null);

      return Table.join(...columns).transpose();
    }
  }
}