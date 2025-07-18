import { z } from "zod/v4";

const NAME = "usd";

/** ------------------------------------------------------------------------- */

const attributes = z.strictObject({
  as: z.literal(NAME),
  year: z.union([z.literal("assume")]).optional(),
  parse: z.string().optional(),
  round: z.union([z.literal("up"), z.literal("down"), z.literal("default")]).default("default"),
});

type Attributes = z.infer<typeof attributes>;

function run(datum: string, attributes: Attributes) {
  let value = Number(datum);

  switch (attributes.round) {
    case "down": value = Math.floor(value * 100) / 100; break;
    case "up": value = Math.ceil(value * 100) / 100; break;
    default: break;
  }

  return value.toFixed(2);
}

/** ------------------------------------------------------------------------- */

const CoerceUSD = { attributes, run, name: NAME };
export default CoerceUSD;