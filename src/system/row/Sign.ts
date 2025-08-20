import { z } from "zod/v4";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export interface SignumRowData {
  type: "sign";
}

/** ------------------------------------------------------------------------- */

/**
 * Get the sign of the current value.
 */
export class SignumRow implements BaseRow {
  run(value: string): Maybe<string> {
    return Math.sign(parseFloat(value)).toString();
  }

  buildJSON(): SignumRowData {
    return { type: "sign" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, SignumRowData> = z.strictObject({
    type: z.literal("sign"),
  }).transform(() => new SignumRow());
}
