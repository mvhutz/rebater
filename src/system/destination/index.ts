import { z } from "zod/v4";
import { State } from "../information/State";
import { CSVDestination } from "./csv";
import BaseDestination from "./base";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("type", [
    CSVDestination.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

function run(destination: Schema, table: Table, state: State) {
  switch (destination.type) {
    case "csv": return CSVDestination.run(destination, table, state);
  }
}

function getDestinationFile(destination: Schema, state: State): string {
  switch (destination.type) {
    case "csv": return CSVDestination.getDestinationFile(destination, state);
  }
}

/** ------------------------------------------------------------------------- */

export const Destination: BaseDestination<Schema> = {
  run,
  getSchema,
  getDestinationFile
}
