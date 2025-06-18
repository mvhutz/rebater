import assert from "node:assert";
import z from "zod/v4";

const NAME = "coerce";

/** ------------------------------------------------------------------------- */

const attributes = z.object({
   year: z.union([z.literal("assume")]).optional(),
   round: z.union([z.literal("up"), z.literal("down"), z.literal("default")]).default("default"),
});

type Attributes = z.infer<typeof attributes>;

function coerceDate(datum: string, attributes: Attributes, context: Context): string {
  const attemptInt = Number(datum);

  let date: Date;
  if (isNaN(attemptInt)) {
    date = new Date(datum);
  } else {
    date = new Date(Date.UTC(0, 0, attemptInt));
  }

  if (attributes.year === "assume") {
    date.setFullYear(context.year);
  }

  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function coerceNumber(datum: string): string {
  return parseFloat(datum).toString();
}

function coerceUSD(datum: string, attributes: Attributes): string {
  let value = Number(datum);

  switch (attributes.round) {
    case "down": value = Math.floor(value * 100) / 100; break;
    case "up": value = Math.ceil(value * 100) / 100; break;
    default: break;
  }

  return `$${value.toFixed(2)}`;
}

const COERCERS = [
  { name: "date", run: coerceDate },
  { name: "number", run: coerceNumber },
  { name: "usd", run: coerceUSD }
] as const;

/** ------------------------------------------------------------------------- */

const schema = attributes.and(z.object({
  type: z.literal(NAME),
  as: z.enum(COERCERS.map(e => e.name))
}));

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const { as } = transformation;
  const coercer = COERCERS.find(e => e.name === as);
  assert.ok(coercer != null, `Coercion to ${as} not found.`);
  return coercer.run(value, transformation, context);
}

/** ------------------------------------------------------------------------- */

const Coerce = { schema, run, name: NAME };
export default Coerce;