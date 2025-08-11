import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * A source operation.
 * 
 * Extract tables from specific sources in the SourceStore.
 */
export interface BaseSource {
  /**
   * Run the operation.
   * @param runner The runner context.s
   * @returns All tables extracted.
   */
  run(runner: Runner): Table[];

  /**
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  buildXML(from: XMLElement): void;
}

/** All possible JSON sources. */
export const SOURCE_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.SCHEMA
]);

/** All possible XML sources. */
export const SOURCE_XML_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.XML_SCHEMA
]);
