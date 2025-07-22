import { z } from "zod/v4";
import { ExcelSource } from "./Excel";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export interface BaseSource {
  getSourceFileGlob(state: State): string;
  run(state: State): Table[];
}

export function getSourceSchema(): z.ZodType<BaseSource> {
  return z.union([
    ExcelSource.SCHEMA
  ]);
}
