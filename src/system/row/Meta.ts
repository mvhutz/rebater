import moment from "moment";
import { z } from "zod/v4";
import { State } from "../information/State";

const NAME = "meta";

/** ------------------------------------------------------------------------- */

export function getQuarterLastDay(state: State): string {
  const time = state.getSettings().getTime();

  return moment()
    .year(time.year)
    .quarter(time.quarter)
    .endOf("quarter")
    .format("MM/DD/YYYY");
}

export function getQuarterNumber(state: State): string {
  return state.getSettings().getTime().quarter.toString();
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

async function run(transformation: Transformation, _v: unknown, _r: unknown, state: State): Promise<string> {
  const meta = META_FUNCTIONS.find(m => m.name === transformation.value)!;
  return meta.get(state).toString();
}

/** ------------------------------------------------------------------------- */

const Meta = { schema, run, name: NAME };
export default Meta;