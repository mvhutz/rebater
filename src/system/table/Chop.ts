import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { ChopTableData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Chops a table in two, given specific criteria.
 * 
 * Given a table, finds the first row such that `column` is one of `is`. Then,
 * assuming it finds a row, it chooses to `keep` either the `"top"` or `"bottom"`
 * of the table (not including the found row).
 * 
 * If it cannot find a row, it `otherwise` chooses to either `"drop"` the entire
 * table, or `"take"` it and leave it as is.
 */
export class ChopTable implements TableOperator {
  /** The column to check. */
  private readonly column: number;
  /** The list of values that the column must match. */
  private readonly is: string[];
  /** Whether to keep the top or bottom of the table. */
  private readonly keep: "top" | "bottom";
  /** Whether to discard to entire table or not, if a row cannot be found. */
  private readonly otherwise: "drop" | "take";

  /**
   * Create a chop operation.
   * @param column The column to check.
   * @param is The list of values that the column must match.
   * @param keep Whether to keep the top or bottom of the table.
   * @param otherwise Whether to discard to entire table or not, if a row cannot be found.
   */
  public constructor(input: ChopTableData) {
    this.column = input.column;
    this.is = input.is;
    this.keep = input.keep;
    this.otherwise = input.otherwise;
  }

  run(input: TableInput): Table {
    const index = input.table.split().findIndex(row => {
      const datum = row.get(this.column);
      if (datum == null) return;
      return this.is.includes(datum.trim());
    });

    if (index === -1) {
      if (this.otherwise === "take") {
        return input.table;
      } else {
        return Table.join([], input.table.info);
      }
    }

    if (this.keep === "top") {
      return input.table.slice(undefined, index);
    } else {
      return input.table. slice(index, undefined);
    }
  }
}
