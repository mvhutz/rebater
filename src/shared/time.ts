import z from "zod/v4";

/** ------------------------------------------------------------------------- */

export type TimeData = z.input<typeof Time.SCHEMA>;

export class Time {
  public static readonly SCHEMA = z.strictObject({
    year: z.number(),
    quarter: z.literal([1, 2, 3, 4]),
  }).transform(o => new Time(o.year, o.quarter));

  public readonly year: number;
  public readonly quarter: 1 | 2 | 3 | 4;

  constructor(year: number, quarter: 1 | 2 | 3 | 4) {
    this.year = year;
    this.quarter = quarter;
  }

  public toJSON(): TimeData {
    return { year: this.year, quarter: this.quarter };
  }

  public toString(): string {
    return `${this.year}-Q${this.quarter}`;
  }
  
  public is(o: Time) {
    return o.quarter === this.quarter && o.year === this.year;
  }

  public static of(data: TimeData) {
    return new Time(data.year, data.quarter);
  }

  private static readonly REGEX = /(?<year>\d{4})-Q(?<quarter>[1234])/;

  public static parse(from: string) {
    const matches = from.match(Time.REGEX);
    if (matches == null) {
      return null;
    }

    const { year, quarter } = matches.groups ?? {};

    const yearParsed = parseFloat(year);
    const quarterParsed = parseFloat(quarter);

    const parsed = Time.SCHEMA.safeParse({ year: yearParsed, quarter: quarterParsed });
    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  }
}
