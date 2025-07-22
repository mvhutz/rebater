import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export interface BaseSource {
  getSourceFileGlob(state: State): string;
  run(state: State): Table[];
}

export const SOURCE_SCHEMA: z.ZodType<BaseSource> = z.union([
  ExcelSource.SCHEMA
]);
