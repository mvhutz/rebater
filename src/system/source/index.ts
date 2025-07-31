import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export interface BaseSource {
  run(runner: Runner): Table[];
  buildXML(from: XMLElement): void;
}

export const SOURCE_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.SCHEMA
]);

export const SOURCE_XML_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.XML_SCHEMA
]);
