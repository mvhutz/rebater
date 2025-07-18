import { z } from "zod/v4";
import Meta from "./Meta";
import { State } from "../information/State";

const NAME = "replace";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  characters: z.string().min(1).optional(),
  substring: z.string().min(1).optional(),
  all: z.string().optional(),
  put: z.string().default(""),
  put_meta: Meta.schema.shape.value.optional(),
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, _r: unknown, state: State): Promise<string> {
  const { characters, put, substring, put_meta, all } = transformation;
  let result = value;

  let truePut = put;
  if (put_meta) {
    truePut = await Meta.run({ type: "meta", value: put_meta }, null, null, state);
  }

  if (characters != null) {
    for (const character of characters) {
      result = result.replace(character, truePut);
    }
  }

  if (substring != null) {
    result = result.replace(substring, truePut);
  }

  if (all != null) {
    if (result === all) {
      result = truePut;
    }
  }

  return result;
}

/** ------------------------------------------------------------------------- */

const Replace = { schema, run, name: NAME };
export default Replace;