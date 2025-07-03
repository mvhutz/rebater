import assert from "node:assert";
import { z } from "zod/v4";
import CoerceDate from "./CoerceDate";
import CoerceNumber from "./CoerceNumber";
import CoerceUSD from "./CoerceUSD";
import { State } from "../../information/State";

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

async function run(transformation: Transformation, value: string, row: Row, state: State) {
  const { as } = transformation;
  const coercer = REGISTERED.find(e => e.name === as);
  assert.ok(coercer != null, `Coercion to ${as} not found.`);

  // We trust this because every transformation matches its schema.
  return coercer.run(value, transformation as never, state);
}

/** ------------------------------------------------------------------------- */

const Coerce = { schema, run, name: NAME };
export default Coerce;