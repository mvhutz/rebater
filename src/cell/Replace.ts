import z from "zod/v4";

const NAME = "replace";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  characters: z.string().min(1).optional(),
  substring: z.string().min(1).optional(),
  put: z.string(),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string) {
  const { characters, put, substring } = transformation;
  let result = value;

  if (characters != null) {
    for (const character of characters) {
      result = result.replace(character, put);
    }
  }

  if (substring != null) {
    result = result.replace(substring, put);
  }

  return result;
}

/** ------------------------------------------------------------------------- */

const Replace = { schema, run, name: NAME };
export default Replace;