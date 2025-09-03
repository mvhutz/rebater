import z from "zod/v4";
import { bad, good, Reply } from "./reply";

/** ------------------------------------------------------------------------- */

export const TimeSchema = z.strictObject({
  year: z.coerce.number().int().nonnegative(),
  quarter: z.literal([1, 2, 3, 4]),
});

/** The JSON schema of a certain time. */
export type TimeData = z.infer<typeof TimeSchema>;

/**
 * Represents a specific time (year and quarter) that the system can handle.
 */
export class Time {
  public readonly year: number;
  public readonly quarter: 1 | 2 | 3 | 4;

  constructor(data: TimeData) {
    this.year = data.year;
    this.quarter = data.quarter;
  }

  public toJSON(): TimeData {
    return { year: this.year, quarter: this.quarter };
  }

  public static asString(time: Time | TimeData) {
    return `${time.year.toString()}-Q${time.quarter.toString()}`;
  } 

  public toString(): string {
    return Time.asString(this);
  }
  
  public is(o: Time) {
    return o.quarter === this.quarter && o.year === this.year;
  }

  private static readonly REGEX = /(?<year>\d{4})-Q(?<quarter>[1234])/;

  /**
   * Attempt to parse a `Time` from a string. The string should be in the format `yyyy-Qq`.
   * @param from The string to parse.
   * @returns If valid, a new `Time` object. Otherwise, `null`.
   */
  public static parse(this: void, from: string): Reply<Time> {
    const matches = from.match(Time.REGEX);
    if (matches == null) {
      return bad(`Time ${from} does not match format 'YYYY-QQ'!`);
    }

    const { year, quarter } = matches.groups ?? {};

    const yearParsed = parseFloat(year);
    const quarterParsed = parseFloat(quarter);

    const parsed = TimeSchema.safeParse({ year: yearParsed, quarter: quarterParsed });
    if (!parsed.success) {
      return bad(z.prettifyError(parsed.error));
    }

    return good(new Time(parsed.data));
  }
}
