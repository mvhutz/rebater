import { z } from "zod/v4";
import { ExcelSource, ExcelSourceData } from "./Excel";
import { Runner } from "../runner/Runner";
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
   * Add this tag to an JSON document.
   */
  buildJSON(): SourceData;
}

/** ------------------------------------------------------------------------- */

export type SourceData =
  | ExcelSourceData;

/** All possible JSON sources. */
export const SOURCE_SCHEMA: z.ZodType<BaseSource, SourceData> = z.union([
  ExcelSource.SCHEMA
]);

