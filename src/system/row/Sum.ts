import { z } from "zod/v4";
import { ExcelIndexSchema, getTrueIndex } from "../util";

const NAME = "sum";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  column: ExcelIndexSchema,
});

type Transformation = z.infer<typeof schema>;

const CACHE = new WeakMap<Table, Map<number, number>>();

async function run(transformation: Transformation, _value: string, row: Row): Promise<string> {
  const { column: _column } = transformation;
  const column = getTrueIndex(_column);

  let cached_table = CACHE.get(row.table);
  if (cached_table == null) {
    CACHE.set(row.table, cached_table = new Map());
  }

  const cached_sum = cached_table.get(column);
  if (cached_sum != null) return cached_sum.toString();

  const sum = row.table.data.reduce((s, b) => s + Number(b.data[column]), 0);
  cached_table.set(column, sum);

  return sum.toString();
}

/** ------------------------------------------------------------------------- */

const Sum = { schema, run, name: NAME };
export default Sum;