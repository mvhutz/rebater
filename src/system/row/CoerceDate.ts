import moment, { Moment } from "moment";
import assert from "assert";
import { RowInput, RowOperator } from ".";
import { CoerceDateRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Attempt to turn a string in a date.
 */
export class CoerceDateRow implements RowOperator {
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
  public constructor(input: CoerceDateRowData) {
    this.year = input.year;
    this.parse = input.parse;
    this.format = input.format;
  }

  run(input: RowInput): string {
    let { value } = input;
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
      date.year(input.context.time.year);
    }

    assert.ok(date.isValid(), `Date '${value}' is in an unknown format.`);
    return date.format(this.format);
  }
}