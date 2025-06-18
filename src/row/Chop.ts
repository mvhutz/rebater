import z from "zod/v4";

const NAME = "chop";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal("chop"),
  column: z.number(),
  is: z.string(),
  keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom")
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, context: Context) {
  void context;

  const { column, is, keep } = transformation;

  const index = table.data.findIndex(row => row[column] == is);
  return {
    ...table,
    data: keep === "top"
      ? table.data.slice(0, index)
      : table.data.slice(index)
  };
}

/** ------------------------------------------------------------------------- */

const Chop = { schema, run, name: NAME };
export default Chop;
