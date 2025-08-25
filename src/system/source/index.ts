import { Runner } from "../runner/Runner";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface SourceInput {
  runner: Runner;
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


