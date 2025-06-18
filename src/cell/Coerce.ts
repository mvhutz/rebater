import assert from "node:assert";
import z from "zod/v4";

const NAME = "coerce";

/** ------------------------------------------------------------------------- */

function coerceDate(datum: string): string {
  const attemptInt = Number(datum);

  let date: Date;
  if (isNaN(attemptInt)) {
    date = new Date(datum);
  } else {
    date = new Date(Date.UTC(0, 0, attemptInt));
  }

  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function coerceNumber(datum: string): string {
  return parseFloat(datum).toString();
}

function coerceUSD(datum: string): string {
  return `$${Number(datum).toFixed(2)}`;
}

const COERCERS = [
  { name: "date", run: coerceDate },
  { name: "number", run: coerceNumber },
  { name: "usd", run: coerceUSD }
] as const;

const schema = z.object({
  type: z.literal(NAME),
  as: z.enum(COERCERS.map(e => e.name))
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string) {
  const { as } = transformation;
  const coercer = COERCERS.find(e => e.name === as);
  assert.ok(coercer != null, `Coercion to ${as} not found.`);
  return coercer.run(value);
}

const Coerce = { schema, run, name: NAME };
export default Coerce;