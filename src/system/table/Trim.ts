import { z } from "zod/v4";

const NAME = "trim";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  top: z.number().optional(),
  bottom: z.number().optional(),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table) {
  const { top, bottom } = transformation;

  table.data = table.data.slice(top == null ? undefined : top, bottom == null ? undefined : -bottom);
  return table;
}

/** ------------------------------------------------------------------------- */

const Trim = { schema, run, name: NAME };
export default Trim;
