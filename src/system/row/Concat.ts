import { z } from "zod/v4";
import { _runMany, _Schema } from ".";
import { State } from "../information/State";

const NAME = "concat";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  with: z.array(z.any()), // Actually a row transformation.
  separator: z.string().default("")
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, state: State): Promise<string> {
  const extra = z.array(_Schema).parse(transformation.with);
  const extra_value = await _runMany(extra, row, state);
  return extra_value + transformation.separator + value;
}

/** ------------------------------------------------------------------------- */

const Concat = { schema, run, name: NAME };
export default Concat;