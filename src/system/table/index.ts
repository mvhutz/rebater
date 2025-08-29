import { Table } from "../information/Table";
import { State } from "../../shared/state";
import { Context } from "../../shared/context";

/** ------------------------------------------------------------------------- */

export interface TableInput {
  table: Table;
  state: State;
  context: Context;
}

/**
 * A table operation.
 * 
 * Given a certain resulting table, figure out where to store it.
 */
export abstract class TableOperator {
  /**
   * Run the operation.
   * @param table The table to modify.
   * @param runner The running context.
   */
  abstract run(input: TableInput): Table;

  /**
   * Run a set of table operations in succession.
   * @param rows The table operations.
   * @param table The table to begin with.
   * @param runner The running context.
   * @returns A modified table.
   */
  static runMany(rows: TableOperator[], input: TableInput) {
    
    for (const operation of rows) {
      input.table = operation.run(input);
    }

    return input.table;
  }
}
