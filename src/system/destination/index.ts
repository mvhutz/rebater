import { z } from "zod/v4";
import { CSVDestination } from "./CSV";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export interface BaseDestination {
  getDestinationFile(state: State): string;
  run(table: Table, state: State): void;
}

export const DESTINATION_SCHEMA: z.ZodType<BaseDestination> = z.union([
  CSVDestination.SCHEMA
]);
