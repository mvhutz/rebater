import moment from "moment";
import z from "zod/v4";

const NAME = "meta";

/** ------------------------------------------------------------------------- */

export function getQuarterLastDay(context: Context) {
  return moment()
    .year(context.year)
    .quarter(context.quarter)
    .endOf("quarter")
    .format("MM/DD/YYYY");
}

export function getQuarterNumber( context: Context) {
  return context.quarter;
}

const META_FUNCTIONS = [
  { name: "quarter.lastday", get: getQuarterLastDay },
  { name: "quarter.number", get: getQuarterNumber }
] as const;

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  value: z.union(META_FUNCTIONS.map(m => z.literal(m.name)))
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, _v: unknown, _r: unknown, context: Context) {
  const meta = META_FUNCTIONS.find(m => m.name === transformation.value)!;
  return meta.get(context).toString();
}

/** ------------------------------------------------------------------------- */

const Meta = { schema, run, name: NAME };
export default Meta;