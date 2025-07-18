import { z } from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";

const NAME = "percolate";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  columns: z.array(ExcelIndexSchema),
  matches: z.array(z.string()).default([""])
});

type Schema = z.infer<typeof schema>;

async function run(transformation: Schema, table: Table): Promise<Table> {
  const { columns, matches } = transformation;
  const indices = new Set(columns.map(getTrueIndex));

  let previous: Maybe<string[]>;
  const rows = new Array<Row>();

  for (const row of table.data) {
    const cells = [...row.data];

    for (const index of indices) {
      if (matches.includes(cells[index])) {
        if (previous == null) continue;
        cells[index] = previous[index];
      }
    }

    previous = cells;
    rows.push({ ...row, data: cells });
  }

  return { ...table, data: rows };
}

/** ------------------------------------------------------------------------- */

const Percolate = { schema, run, name: NAME };
export default Percolate;
