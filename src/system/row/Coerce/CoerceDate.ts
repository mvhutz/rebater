import z from "zod/v4";
import moment, { Moment } from "moment";
import assert from "assert";
import { BaseRow } from "..";
import { Runner } from "../../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class CoerceDateRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("coerce"),
    as: z.literal("date"),
    year: z.union([z.literal("assume")]).optional(),
    parse: z.union([z.string(), z.array(z.string())]).optional(),
    format: z.string().default("M/D/YYYY")
  }).transform(s => new CoerceDateRow(s.format, s.year, s.parse));

  private readonly year?: "assume";
  private readonly parse?: string | string[];
  private readonly format: string;

  private static readonly COMMON_DATES = [
    "M/D/YYYY",
    "M/D/YY",
    "MM.DD.YYYY",
    "M.D.YYYY",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "YY/MM/DD"
  ];

  public constructor(format: string, year?: "assume", parse?: string | string[]) {
    this.year = year;
    this.parse = parse;
    this.format = format;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const attemptInt = Number(value);
    let date: Moment;

    if (this.parse) {
      if (value.length === 5) value = "0" + value;
      if (value.length === 7) value = "0" + value;
      date = moment(value, this.parse);
    } else if (!isNaN(attemptInt)) {
      date = moment(Date.UTC(0, 0, attemptInt));
    } else {
      date = moment(value, CoerceDateRow.COMMON_DATES);
    }

    if (this.year === "assume") {
      date.year(runner.settings.getTime().year);
    }

    assert.ok(date.isValid(), `Date ${value} could not be parsed.`);
    return date.format(this.format);
  }

  build(from: XMLElement): void {
    from.element("coerce", {
      as: "date",
      year: this.year,
      parse: JSON.stringify(this.parse),
      format: this.format,
    })
  }
}