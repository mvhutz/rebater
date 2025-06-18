import z from "zod/v4";

const NAME = "replace";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  find: z.string().min(1),
  put: z.string().length(1),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string) {
  const { find, put } = transformation;
  let result = value;

  for (const character of find) {
    result = result.replace(character, put);
  }

  return result;
}

const Replace = { schema, run, name: NAME };
export default Replace;