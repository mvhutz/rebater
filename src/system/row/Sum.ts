import { z } from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";

const NAME = "sum";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  column: ExcelIndexSchema,
});

type Transformation = z.infer<typeof schema>;

const CACHE = new Map<string, number>();

function getHash(table: Table, index: number) {
  return `${table.path}||||${index}`;
}

async function run(transformation: Transformation, _value: string, row: Row): Promise<string> {
  const { column: _column } = transformation;
  const column = getTrueIndex(_column);

  const hash = getHash(row.table, column);
  const cached_sum = CACHE.get(hash);
  if (cached_sum != null) return cached_sum.toString();

  const sum = row.table.data.reduce((s, b) => s + Number(b.data[column]), 0);
  CACHE.set(hash, sum);
  console.log(CACHE);

  return sum.toString();
}

/** ------------------------------------------------------------------------- */

const Sum = { schema, run, name: NAME };
export default Sum;