import { z } from "zod/v4";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export interface AbsoluteRowData {
  type: "abs"
}

/** ------------------------------------------------------------------------- */

/**
 * Get the absolute value of a value.
 */
export class AbsoluteRow implements BaseRow {
  run(value: string): Maybe<string> {
    return Math.abs(parseFloat(value)).toString();
  }

  buildJSON(): AbsoluteRowData {
    return { type: "abs" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, AbsoluteRowData> = z.strictObject({
    type: z.literal("abs"),
  }).transform(() => new AbsoluteRow());
}
