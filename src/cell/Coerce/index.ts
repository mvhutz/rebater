import assert from "node:assert";
import z from "zod/v4";
import CoerceDate from "./CoerceDate";
import CoerceNumber from "./CoerceNumber";
import CoerceUSD from "./CoerceUSD";

const NAME = "coerce";

/** ------------------------------------------------------------------------- */

const REGISTERED = [
  CoerceDate,
  CoerceNumber,
  CoerceUSD,
] as const;

/** ------------------------------------------------------------------------- */

type Transformation = z.infer<typeof schema>;

export const schema = z.discriminatedUnion("as", [
  REGISTERED[0].attributes,
  ...REGISTERED.slice(1).map(r => r.attributes)
]);

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const { as } = transformation;
  const coercer = REGISTERED.find(e => e.name === as);
  assert.ok(coercer != null, `Coercion to ${as} not found.`);

  // We trust this because every transformation matches its schema.
  return coercer.run(value, transformation as never, context);
}

/** ------------------------------------------------------------------------- */

const Coerce = { schema, run, name: NAME };
export default Coerce;