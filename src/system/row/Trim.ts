import { z } from "zod/v4";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export interface TrimRowData {
  type: "trim";
}

/** ------------------------------------------------------------------------- */

/**
 * Trim the whitespace off of the current value.
 */
export class TrimRow implements BaseRow {
  run(value: string): Maybe<string> {
    return value.trim();
  }

  buildJSON(): TrimRowData {
    return { type: "trim" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, TrimRowData> = z.strictObject({
    type: z.literal("trim"),
  }).transform(() => new TrimRow());
}
