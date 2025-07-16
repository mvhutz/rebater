import moment, { Moment } from "moment";
import assert from "assert";
import { z } from "zod/v4";
import { State } from "../../information/State";

const NAME = "date";

/** ------------------------------------------------------------------------- */

const attributes = z.strictObject({
  type: z.literal("coerce"),
  as: z.literal(NAME),
  year: z.union([z.literal("assume")]).optional(),
  parse: z.union([z.string(), z.array(z.string())]).optional(),
  format: z.string().default("M/D/YYYY")
});

type Attributes = z.infer<typeof attributes>;

const COMMON_DATES = [
  "M/D/YYYY",
  "M/D/YY",
  "MM.DD.YYYY",
  "M.D.YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
  "YY/MM/DD"
];

function run(datum: string, attributes: Attributes, state: State) {
  const { parse, year, format } = attributes;
  const attemptInt = Number(datum);
  let date: Moment;

  if (parse) {
    if (datum.length === 5) datum = "0" + datum;
    if (datum.length === 7) datum = "0" + datum;
    date = moment(datum, parse);
  } else if (!isNaN(attemptInt)) {
    date = moment(Date.UTC(0, 0, attemptInt));
  } else {
    date = moment(datum, COMMON_DATES);
  }

  if (year === "assume") {
    date.year(state.getSettings().getTime().year);
  }

  assert.ok(date.isValid(), `Date ${datum} could not be parsed.`);
  return date.format(format);
}

/** ------------------------------------------------------------------------- */

const CoerceDate = { attributes, run, name: NAME };
export default CoerceDate;