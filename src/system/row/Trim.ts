import { z } from "zod/v4";

const NAME = "trim";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
});

type Transformation = z.infer<typeof schema>;

async function run(_transformation: Transformation, value: string): Promise<string> {
  return value.trim();
}

/** ------------------------------------------------------------------------- */

const Trim = { schema, run, name: NAME };
export default Trim;
