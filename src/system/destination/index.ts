import { z } from "zod/v4";
import { RebateDestination, RebateDestinationData } from "./Rebate";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
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
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  buildXML(from: XMLElement): void;

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

/** All possible XML destinations. */
export const DESTINATION_XML_SCHEMA: z.ZodType<BaseDestination> = z.union([
  RebateDestination.XML_SCHEMA,
  UtilityDestination.XML_SCHEMA
]);
