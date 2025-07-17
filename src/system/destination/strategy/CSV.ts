import { unparse } from "papaparse";
import { z } from "zod/v4";
import { makeNodeElementSchema } from "../../xml";
import { Destination } from ".";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return makeNodeElementSchema(
    z.literal("csv"),
    z.strictObject({
      name: z.string()
    }),
    z.never()
  );
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const CSVDestination: Destination<Schema> = {
  name: "csv",
  getSchema,

  getFile({ destination, state }) {
    return state.getSettings().getDestinationPath(destination.name);
  },

  run(table, { destination, state }) {
    const data = table.data.map(row => row.data);
    const buffer = Buffer.from(unparse(data));

    const file = CSVDestination.getFile({ destination, state });
    state.appendDestinationFile(file, buffer);
  },
};
