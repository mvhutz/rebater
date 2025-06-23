import z from "zod/v4";
import CSV from "../destination/CSV";
import Destination from "../destination";

const NAME = "debug";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  name: z.string().default("default"),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, context: Context) {
  const destination: Destination = {
    type: "csv",
    group: "debug",
    subgroup: transformation.name,
  };

  await CSV.run(destination, table, context)
  return table;
}

/** ------------------------------------------------------------------------- */

const Debug = { schema, run, name: NAME };
export default Debug;
