import z from "zod/v4";
import { _runMany, _Schema } from ".";

const NAME = "concat";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  with: z.array(z.any()), // Actually a cell transformation.
  separator: z.string().default("")
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const extra = z.array(_Schema).parse(transformation.with);
  const extra_value = await _runMany(extra, row, context);
  return extra_value + transformation.separator + value;
}

/** ------------------------------------------------------------------------- */

const Concat = { schema, run, name: NAME };
export default Concat;