import z from "zod/v4";
import CellTransformation from "../cell";

const NAME = "filter";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  criteria: z.array(z.unknown()) // Actually a cell transformation.
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, context: Context): Promise<Table> {
  const criteria = z.array(CellTransformation.Schema).parse(transformation.criteria);

  const rows = new Array<Row>();
  for (const row of table.data) {
    const value = await CellTransformation.runMany(criteria, row, context);
    if (value === "true") rows.push(row);
  }

  return { ...table, data: rows };
}

/** ------------------------------------------------------------------------- */

const Filter = { schema, run, name: NAME };
export default Filter;
