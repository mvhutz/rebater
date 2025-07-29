import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import { Runner } from "../runner/Runner";

/** ------------------------------------------------------------------------- */

export interface BaseSource {
  run(runner: Runner): Table[];
}

export const SOURCE_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.SCHEMA
]);
