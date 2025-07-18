import { z } from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";
import RowTransformation from "../row";
import { State } from "../information/State";

const NAME = "set";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  column: ExcelIndexSchema,
  to: z.array(z.unknown()) // Actually a row transformation.
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table, state: State) {
  const { column: _column, to: _to } = transformation;
  const column = getTrueIndex(_column);
  const to = z.array(RowTransformation.Schema).parse(_to);

  for (const row of table.data) {
    const value = await RowTransformation.runMany(to, row, state);
    row.data[column] = value;
  }

  return table;
}

/** ------------------------------------------------------------------------- */

const Set = { schema, run, name: NAME };
export default Set;
