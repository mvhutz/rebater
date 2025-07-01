import z from "zod/v4";
import CellTransformation from "../cell";
import { State } from "../information/State";

const NAME = "filter";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  criteria: z.array(z.unknown()) // Actually a cell transformation.
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, state: State): Promise<Table> {
  const criteria = z.array(CellTransformation.Schema).parse(transformation.criteria);

  const rows = new Array<Row>();
  for (const row of table.data) {
    const value = await CellTransformation.runMany(criteria, row, state);
    if (value === "true") rows.push(row);
  }

  return { ...table, data: rows };
}

/** ------------------------------------------------------------------------- */

const Filter = { schema, run, name: NAME };
export default Filter;
