import { Table } from "../information/Table";
import { State } from "../../shared/state";
import { Settings } from "../../shared/settings";

/** ------------------------------------------------------------------------- */

export interface SourceInput {
  state: State;
  settings: Settings;
}

/**
 * A source operation.
 * 
 * Extract tables from specific sources in the SourceStore.
 */
export interface SourceOperator {
  /**
   * Run the operation.
   * @param runner The runner context.s
   * @returns All tables extracted.
   */
  run(input: SourceInput): Table[];
}


