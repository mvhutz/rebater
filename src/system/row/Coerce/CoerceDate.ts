import moment, { Moment } from "moment";
import assert from "node:assert";
import { z } from "zod/v4";
import { State } from "../../information/State";

const NAME = "date";

/** ------------------------------------------------------------------------- */

const attributes = z.strictObject({
  type: z.literal("coerce"),
  as: z.literal(NAME),
  year: z.union([z.literal("assume")]).optional(),
  parse: z.string().optional(),
  format: z.string().default("M/D/YYYY")
});

type Attributes = z.infer<typeof attributes>;

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
  } else if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(datum)) {
    date = moment(datum, "MM/DD/YYYY");
  } else {
    date = moment(datum);
  }

  if (year === "assume") {
    date.year(state.getTime().year);
  }

  assert.ok(date.isValid(), `Date ${datum} could not be parsed.`);
  return date.format(format);
}

/** ------------------------------------------------------------------------- */

const CoerceDate = { attributes, run, name: NAME };
export default CoerceDate;