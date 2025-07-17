import { z } from "zod/v4";
import { State } from "../information/State";
import { CSVDestination } from "../destination/strategy/CSV";

const NAME = "debug";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  name: z.string().default("default"),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, state: State) {
  CSVDestination.run({
    type: "csv",
    name: transformation.name,
  }, table, state)
  return table;
}

/** ------------------------------------------------------------------------- */

const Debug = { schema, run, name: NAME };
export default Debug;
