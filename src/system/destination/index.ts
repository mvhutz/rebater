import { Table } from "../information/Table";
import { State } from "../../shared/state";

/** ------------------------------------------------------------------------- */

export interface DestinationInput {
  table: Table;
  state: State;
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
  run(input: DestinationInput): Promise<void>;
}
