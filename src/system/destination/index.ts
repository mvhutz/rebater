import { z } from "zod/v4";
import { RebateDestination, RebateDestinationData } from "./Rebate";
import { Runner } from "../runner/Runner";
import { UtilityDestination, UtilityDestinationData } from "./Utility";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * A destination operation.
 * 
 * Given a certain resulting table, figure out where to store it.
 */
export interface BaseDestination {
  /**
   * Run the operation.
   * @param table The table to send.
   * @param runner The running context.
   */
  run(table: Table, runner: Runner): void;
  
  /**
   * Add this tag to an JSON document.
   */
  buildJSON(): DestinationData;
}

/** ------------------------------------------------------------------------- */

export type DestinationData =
  | RebateDestinationData
  | UtilityDestinationData;

/** All possible JSON destinations. */
export const DESTINATION_SCHEMA: z.ZodType<BaseDestination, DestinationData> = z.union([
  RebateDestination.SCHEMA,
  UtilityDestination.SCHEMA
]);
