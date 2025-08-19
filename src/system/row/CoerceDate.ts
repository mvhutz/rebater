import z from "zod/v4";
import moment, { Moment } from "moment";
import assert from "assert";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface CoerceDateRowData {
  type: "coerce";
  as: "date";
  year?: "assume" | "keep",
  parse?: string[];
  format?: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Attempt to turn a string in a date.
 */
export class CoerceDateRow implements BaseRow {
  /**
   * If "assume", disard the year of the date, and make it the year of the
   * current quarter.
   */
  private readonly year: "assume" | "keep";
  /** Specify a format to parse from, if it is particularly unique. */
  private readonly parse: string[];
  /** The format that the date will be parsed to. */
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

  /**
   * Create a corce date operation.
   * @param format Specify a format to parse from, if it is particularly unique.
   * @param year If "assume", disard the year of the date, and make it the year of the
   * current quarter.
   * @param parse The format that the date will be parsed to.
   */
  public constructor(data: CoerceDateRowData) {
    this.year = data.year ?? "keep";
    this.parse = data.parse ?? [];
    this.format = data.format ?? "M/D/YYYY";
  }

  run(value: string, _r: Row, runner: Runner): Maybe<string> {
    const attemptInt = Number(value);
    let date: Moment;

    if (this.parse.length > 0) {
      if (value.length === 5) value = "0" + value;
      if (value.length === 7) value = "0" + value;
      date = moment(value, this.parse.concat(CoerceDateRow.COMMON_DATES));
    } else if (!isNaN(attemptInt)) {
      date = moment(Date.UTC(0, 0, attemptInt));
    } else {
      date = moment(value, CoerceDateRow.COMMON_DATES);
    }

    if (this.year === "assume") {
      date.year(runner.settings.time.year);
    }

    assert.ok(date.isValid(), `Date ${value} could not be parsed.`);
    return date.format(this.format);
  }

  buildJSON(): CoerceDateRowData {
    return {
      year: this.year,
      format: this.format,
      parse: this.parse,
      type: "coerce",
      as: "date"
    }
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, CoerceDateRowData> = z.strictObject({
    type: z.literal("coerce"),
    as: z.literal("date"),
    year: z.union([z.literal("assume"), z.literal("keep")]).optional(),
    parse: z.array(z.string()).optional(),
    format: z.string().optional()
  }).transform(s => new CoerceDateRow(s));

  buildXML(from: XMLElement): void {
    from.element("coerce", {
      as: "date",
      year: this.year,
      parse: Array.isArray(this.parse) ? this.parse.join(",") : this.parse,
      format: this.format,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("coerce",
    z.strictObject({
      as: z.literal("date"),
      year: z.union([z.literal("assume"), z.literal("keep")]).default("keep"),
      parse: z.string().default("").transform(s => s.split(",").filter(Boolean)),
      format: z.string().default("M/D/YYYY")
    }),
    z.undefined())
    .transform(({ attributes: a }) => new CoerceDateRow({ ...a, type: "coerce" }))
}