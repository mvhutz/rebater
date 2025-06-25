import moment, { Moment } from "moment";
import assert from "node:assert";
import z from "zod/v4";

const NAME = "coerce";

/** ------------------------------------------------------------------------- */

const attributes = z.strictObject({
  year: z.union([z.literal("assume")]).optional(),
  round: z.union([z.literal("up"), z.literal("down"), z.literal("default")]).default("default"),
  parse: z.string().optional(),
  otherwise: z.string().optional(),
});

type Attributes = z.infer<typeof attributes>;

function coerceDate(datum: string, attributes: Attributes, context: Context): string {
  const attemptInt = Number(datum);
  let date: Moment;

  if (attributes.parse) {
    if (datum.length === 5) datum = "0" + datum;
    if (datum.length === 7) datum = "0" + datum;
    date = moment(datum, attributes.parse);
  } else if (!isNaN(attemptInt)) {
    date = moment(Date.UTC(0, 0, attemptInt));
  } else if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(datum)) {
    date = moment(datum, "MM/DD/YYYY");
  } else {
    date = moment(datum);
  }

  if (attributes.year === "assume") {
    date.year(context.year);
  }

  assert.ok(date.isValid(), `Date ${datum} could not be parsed.`);
  return date.format("M/D/YYYY");
}

function coerceNumber(datum: string, attributes: Attributes): string {
  const float = parseFloat(datum);

  if (isNaN(float) && attributes.otherwise != null) {
    return attributes.otherwise;
  } else {
    return float.toString();
  }
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

const schema = z.strictObject({
  type: z.literal(NAME),
  as: z.enum(COERCERS.map(e => e.name)),
  ...attributes.shape
});

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