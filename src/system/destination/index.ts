import { z } from "zod/v4";
import { CSVDestination } from "./strategy/CSV";
import { Destination as DestinationType } from "./strategy";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.discriminatedUnion("name", [
    CSVDestination.getSchema()
  ]);
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Destination: DestinationType<Schema> = {
  name: "csv",
  getSchema,

  run(table, { destination, state }) {
    switch (destination.name) {
      case "csv": return CSVDestination.run(table, { destination, state });
    }
  },

  getFile({ destination, state }) {
    switch (destination.name) {
      case "csv": return CSVDestination.getFile({ destination, state });
    }
  },
}
