import { z } from "zod/v4";
import { makeNodeElement, makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";
import { CSV } from "../../destination/strategy/CSV";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("debug"),
  z.strictObject({
    name: z.string().default("DEBUG")
  }),
  z.undefined()
)

type Schema = z.infer<ReturnType<typeof getSchema>>;
/** ------------------------------------------------------------------------- */

export const Debug = {
  name: "debug",
  getSchema,

  async run(table, { state, transformation: { attributes } }) {
    CSV.run(table, { state, destination: makeNodeElement("csv", attributes) });
    return table;
  },

} satisfies TableTransformation<Schema>;
