import { z } from "zod/v4";
import { State } from "../information/State";

const NAME = "counter";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, state: State): Promise<string> {
  const counter = state.getCounter(transformation.type);

  const result = counter.get();
  counter.increment();

  return result.toString();
}

/** ------------------------------------------------------------------------- */

const Counter = { schema, run, name: NAME };
export default Counter;