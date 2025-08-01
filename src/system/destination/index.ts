import { z } from "zod/v4";
import { RebateDestination } from "./Rebate";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { UtilityDestination } from "./Utility";

/** ------------------------------------------------------------------------- */

export interface BaseDestination {
  run(table: Table, runner: Runner): void;
  buildXML(from: XMLElement): void;
}

export const DESTINATION_SCHEMA: z.ZodType<BaseDestination> = z.union([
  RebateDestination.SCHEMA,
  UtilityDestination.SCHEMA
]);

export const DESTINATION_XML_SCHEMA: z.ZodType<BaseDestination> = z.union([
  RebateDestination.XML_SCHEMA,
  UtilityDestination.XML_SCHEMA
]);
