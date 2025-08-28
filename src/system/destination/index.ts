import { Table } from "../information/Table";
import { State } from "../../shared/state";
import { Settings } from "../../shared/settings";

/** ------------------------------------------------------------------------- */

export interface DestinationInput {
  table: Table;
  state: State;
  settings: Settings;
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
