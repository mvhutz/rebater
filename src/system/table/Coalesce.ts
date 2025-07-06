import { z } from "zod/v4";
import { ExcelIndex, ExcelIndexSchema, getTrueIndex } from "../util";
import assert from "assert";

const NAME = "coalesce";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  match: z.array(ExcelIndexSchema),
  combine: z.array(ExcelIndexSchema).default([])
});

type Schema = z.infer<typeof schema>;

function getHash(row: Row, matches: ExcelIndex[]) {
  const array = matches.map(m => row.data[getTrueIndex(m)]);
  return JSON.stringify(array);
}

function combineRows(combineOn: ExcelIndex[], rows: Row[]) {
  const result = structuredClone(rows.pop());
  assert.ok(result != null, "Cannot coalesce empty set of arrays.");

  const indices = combineOn.map(getTrueIndex);

  for (const row of rows) {
    for (const index of indices) {
      result.data[index] = (Number(row.data[index]) + Number(result.data[index])).toString()
    }
  }

  return result;
}

async function run(transformation: Schema, table: Table): Promise<Table> {
  const { match, combine } = transformation;

  const matched = new Map<string, Row[]>();
  for (const row of table.data) {
    const hash = getHash(row, match);
    const list = matched.get(hash);

    if (list == null) {
      matched.set(hash, [row]);
    } else {
      list.push(row);
    }
  }

  const combined = [...matched.values()].map(combineRows.bind(null, combine));
  return { ...table, data: combined };
}

/** ------------------------------------------------------------------------- */

const Coalesce = { schema, run, name: NAME };
export default Coalesce;
