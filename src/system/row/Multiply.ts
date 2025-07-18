import { z } from "zod/v4";
import { _runMany, _Schema } from ".";
import { State } from "../information/State";

const NAME = "multiply";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  with: z.array(z.any()), // Actually a row transformation.
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, state: State): Promise<string> {
  const extra = z.array(_Schema).parse(transformation.with);
  const extra_value = await _runMany(extra, row, state);
  return (Number(extra_value) * Number(value)).toString();
}

/** ------------------------------------------------------------------------- */

const Multiply = { schema, run, name: NAME };
export default Multiply;