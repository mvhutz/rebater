import moment from "moment";
import z from "zod/v4";

const NAME = "meta";

/** ------------------------------------------------------------------------- */

function getQuarterLastDay(context: Context) {
  return moment()
    .year(context.year)
    .quarter(context.quarter)
    .endOf("quarter")
    .format("MM/DD/YYYY");
}

const META = [
  { name: "quarter.lastday", get: getQuarterLastDay }
] as const;

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  value: z.union(META.map(m => z.literal(m.name)))
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const meta = META.find(m => m.name === transformation.value)!;
  return meta.get(context);
}

/** ------------------------------------------------------------------------- */

const Meta = { schema, run, name: NAME };
export default Meta;