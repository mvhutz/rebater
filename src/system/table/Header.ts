import { z } from "zod/v4";
import { rewire } from "../util";

const NAME = "header";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  name: z.string(),
  action: z.union([z.literal("drop")]),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table) {
  const { name } = transformation;

  const index = table.data[0].data.findIndex(r => r === name);
  if (index === -1) return table;

  const rows = table.data.map(r => ({
    ...r,
    data: r.data.filter((_, i) => i !== index)
  }));

  return rewire({ ...table, data: rows });
}

/** ------------------------------------------------------------------------- */

const Header = { schema, run, name: NAME };
export default Header;
