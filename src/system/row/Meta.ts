import moment from "moment";
import { z } from "zod/v4";
import { State } from "../information/State";
import path from "path";

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

function getRowSource(row: Row) {
  return path.basename(row.table.path);
}

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  value: z.union([
    z.literal("quarter.lastday"),
    z.literal("quarter.number"),
    z.literal("row.source"),
  ])
});

type Transformation = z.infer<typeof schema>;

async function run(transformation: Transformation, _v: unknown, row: Row, state: State): Promise<string> {
  switch (transformation.value) {
    case "quarter.lastday": return getQuarterLastDay(state);
    case "quarter.number": return getQuarterNumber(state);
    case "row.source": return getRowSource(row);
  }
}

/** ------------------------------------------------------------------------- */

const Meta = { schema, run, name: NAME };
export default Meta;