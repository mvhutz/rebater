import { z } from "zod/v4";

const NAME = "literal";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  value: z.coerce.string()
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation): Promise<string> {
  return transformation.value;
}

/** ------------------------------------------------------------------------- */

const Literal = { schema, run, name: NAME };
export default Literal;