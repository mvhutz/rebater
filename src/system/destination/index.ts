import { Runner } from "../runner/Runner";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface DestinationInput {
  table: Table;
  runner: Runner;
}

/**
 * A destination operation.
 * 
 * Given a certain resulting table, figure out where to store it.
 */
export interface DestinationOperator {
  /**
   * Run the operation.
   * @param table The table to send.
   * @param runner The running context.
   */
  run(input: DestinationInput): void;
}
