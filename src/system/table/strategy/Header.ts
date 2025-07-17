import { z } from "zod/v4";
import { rewire } from "../../util";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("header"),
  z.strictObject({
    name: z.string(),
    action: z.union([z.literal("drop")]),
  }),
  z.undefined(),
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Header = {
  name: "header",
  getSchema,
  async run(table, { transformation: { attributes: { name } } }) {
    const index = table.data[0].data.findIndex(r => r === name);
    if (index === -1) return table;

    const rows = table.data.map(r => ({
      ...r,
      data: r.data.filter((_, i) => i !== index)
    }));

    return rewire({ ...table, data: rows });
  },
} satisfies TableTransformation<Schema>;
