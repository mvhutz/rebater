import z from "zod/v4";

const NAME = "column";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  index: z.number()
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row) {
  return row.data[transformation.index];
}

const Column = { schema, run, name: NAME };
export default Column;