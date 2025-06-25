import z from "zod/v4";

const NAME = "chop";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal("chop"),
  column: z.number(),
  is: z.array(z.string()),
  keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
  otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, context: Context) {
  void [context];

  const { column, is, keep, otherwise } = transformation;

  const index = table.data.findIndex(row => is.includes(row.data[column].trim()));
  if (index === -1) {
    // console.log(`Chop not found for ${table.path}`);
    if (otherwise === "take") {
      return table;
    } else {
      return { ...table, data: [] };
    }
  }

  const data = keep === "top"
      ? table.data.slice(undefined, index)
      : table.data.slice(index, undefined);

  return { ...table, data };
}

/** ------------------------------------------------------------------------- */

const Chop = { schema, run, name: NAME };
export default Chop;
