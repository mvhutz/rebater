import z from "zod/v4";
import CSV from "../destination/CSV";
import Destination from "../destination";
import { State } from "../information/State";

const NAME = "debug";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  name: z.string().default("default"),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, state: State) {
  const destination: Destination = {
    type: "csv",
    group: "debug",
    subgroup: transformation.name,
  };

  await CSV.run(destination, table, state)
  return table;
}

/** ------------------------------------------------------------------------- */

const Debug = { schema, run, name: NAME };
export default Debug;
