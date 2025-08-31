import { RowOperator } from "../row";
import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { FilterTableData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Filters rows, based a certain criteria.
 * 
 * For each row in the table, a set of row transformations are run. If the
 * resulting value is truthy, the row is kept.
 */
export class FilterTable implements TableOperator {
  /** The criteria to check. */
  private readonly criteria: RowOperator[];

  /**
   * Create a filter operation.
   * @param criteria The criteria to check.
   */
  public constructor(input: FilterTableData) {
    this.criteria = input.criteria.map(AdvancedTransformer.parseRow);
  }

  run(input: TableInput): Table {
    return input.table.filter(row => {
      const value = RowOperator.runMany(this.criteria, { row, ...input });
      if (!value.ok) {
        input.stats.issues.ignored_row.push({
          transformer: input.transformer,
          row: row.split() as string[],
          source: row.source,
          reason: value.reason
        });
        
        return false;
      }

      return value.data === "true";
    });
  }
}