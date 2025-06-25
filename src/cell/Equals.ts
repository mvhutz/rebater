import z from "zod/v4";
import { _runMany, _Schema } from ".";

const NAME = "equals";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  with: z.array(z.any()), // Actually a cell transformation.
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const extra = z.array(_Schema).parse(transformation.with);
  const extra_value = await _runMany(extra, row, context);
  return (extra_value === value).toString();
}

/** ------------------------------------------------------------------------- */

const Equals = { schema, run, name: NAME };
export default Equals;