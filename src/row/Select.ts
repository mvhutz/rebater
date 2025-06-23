import z from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";

const NAME = "select";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal("select"),
  column: ExcelIndexSchema,
  is: z.union([z.string(), z.array(z.string())]).optional(),
  isnt: z.union([z.string(), z.array(z.string())]).optional(),
  action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table) {
  const { column, is, isnt, action } = transformation;

  const trueIs = is == null || Array.isArray(is) ? is : [is];
  const trueIsnt = isnt == null || Array.isArray(isnt) ? isnt : [isnt];

  const rows = table.data.filter(row => {
    const datum = row.data[getTrueIndex(column)];
    return (action === "keep") === (trueIs?.includes(datum) || (trueIsnt != null && !trueIsnt.includes(datum)));
  });

  return { ...table, data: rows };
}

/** ------------------------------------------------------------------------- */

const Select = { schema, run, name: NAME };
export default Select;
