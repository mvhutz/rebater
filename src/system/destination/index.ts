import { z } from "zod/v4";
import { CSVDestination } from "./CSV";
import { Runner } from "../runner/Runner";

/** ------------------------------------------------------------------------- */

export interface BaseDestination {
  run(table: Table, runner: Runner): void;
}

export const DESTINATION_SCHEMA: z.ZodType<BaseDestination> = z.union([
  CSVDestination.SCHEMA
]);
