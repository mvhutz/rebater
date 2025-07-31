import { z } from "zod/v4";
import { CSVDestination } from "./CSV";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export interface BaseDestination {
  run(table: Table, runner: Runner): void;
  buildXML(from: XMLElement): void;
}

export const DESTINATION_SCHEMA: z.ZodType<BaseDestination> = z.union([
  CSVDestination.SCHEMA
]);

export const DESTINATION_XML_SCHEMA: z.ZodType<BaseDestination> = z.union([
  CSVDestination.XML_SCHEMA
]);
