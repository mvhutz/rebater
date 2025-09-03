import { RowOperator } from "../row";
import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { SetTableData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Sets a specific columns value.
 * 
 * For each row, a set of row transformations are performed on it. The resulting
 * value is put into a specific column cell of that row.
 */
export class SetTable implements TableOperator {
  /** The column cell to put the value in. */
  private readonly column: number;
  /** The set of row transformations. */
  private readonly to: RowOperator[];

  /**
   * Create a set operation.
   * @param column The column cell to put the value in.
   * @param to The set of row transformations.
   */
  public constructor(input: SetTableData) {
    this.column = input.column;
    this.to = input.to.map(AdvancedTransformer.parseRow);
  }

  run(input: TableInput): Table {
    return input.table.update(row => {
      const value = RowOperator.runMany(this.to, { row, ...input });
      if (!value.ok) {
        input.stats.issues.ignored_row.push({
          transformer: input.transformer,
          row: row.split() as string[],
          source: row.source,
          reason: value.reason
        });
        
        return null;
      }

      return row.set(this.column, value.data);
    });
  }
}
