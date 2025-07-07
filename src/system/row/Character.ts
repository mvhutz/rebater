import { z } from "zod/v4";

const NAME = "character";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  select: z.string(),
  action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string): Promise<string> {
  const { select, action } = transformation;

  const characters = value.split("");
  return characters
    .filter(c => select.includes(c) === (action === "keep"))
    .join("");
}

/** ------------------------------------------------------------------------- */

const Character = { schema, run, name: NAME };
export default Character;