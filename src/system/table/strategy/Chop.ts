import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../../util";
import { makeNodeElementSchema } from "../../xml";
import { TableTransformation } from ".";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("chop"),
  z.strictObject({
    column: ExcelIndexSchema,
    is: z.string()
      .transform(v => z.array(z.string()).parse(JSON.parse(v))),
    keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
    otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
  }),
  z.never(),
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Chop = {
  name: "chop",
  getSchema,
  async run(table, { transformation: { attributes: { column, is, keep, otherwise } } }) {
    const index = table.data.findIndex(row => is.includes(row.data[column].trim()));
    if (index === -1) {
      if (otherwise === "take") {
        return table;
      } else {
        return { ...table, data: [] };
      }
    }

    const data = keep === "top"
        ? table.data.slice(undefined, index)
        : table.data.slice(index, undefined);

    return rewire({ ...table, data });
  },
} satisfies TableTransformation<Schema>;
