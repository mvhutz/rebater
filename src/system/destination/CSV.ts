
import { unparse } from "papaparse";
import { z } from "zod/v4";
import { State } from "../information/State";
import BaseDestination from "./base";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.strictObject({
    type: z.literal("csv"),
    name: z.string(),
  });
};

type Schema = z.infer<ReturnType<typeof getSchema>>;

function getDestinationFile(destination: Schema, state: State): string {
  return state.getSettings().strategy.getDestinationPath(destination.name, state.getTime());
}

function run(destination: Schema, table: Table, state: State): void {
  const data = table.data.map(row => row.data);
  const buffer = Buffer.from(unparse(data));

  state.appendDestinationFile(getDestinationFile(destination, state), buffer);
}

export const CSVDestination: BaseDestination<Schema> = { getSchema, run, getDestinationFile };
