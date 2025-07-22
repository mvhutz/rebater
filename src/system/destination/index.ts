import { z } from "zod/v4";
import { CSVDestination } from "./CSV";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export interface BaseDestination {
  getDestinationFile(state: State): string;
  run(table: Table, state: State): void;
}

export function getDestinationSchema(): z.ZodType<BaseDestination> {
  return z.union([
    CSVDestination.SCHEMA
  ]);
}
