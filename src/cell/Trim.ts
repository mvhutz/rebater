import z from "zod/v4";

const NAME = "trim";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string) {
  return value.trim();
}

const Trim = { schema, run, name: NAME };
export default Trim;
