import z from "zod/v4";

const NAME = "select";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal("select"),
  column: z.number(),
  is: z.string().optional(),
  isnt: z.string().optional(),
  action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table) {
  const { column, is, isnt, action } = transformation;

  const rows = table.data.filter(row => {
    const datum = row.data[column];
    return (action === "keep") === ((is != null && is == datum) || (isnt != null && isnt != datum));
  });

  return { ...table, data: rows };
}

/** ------------------------------------------------------------------------- */

const Select = { schema, run, name: NAME };
export default Select;
