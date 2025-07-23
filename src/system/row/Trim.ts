import { z } from "zod/v4";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export class TrimRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("trim"),
  }).transform(() => new TrimRow());

  async run(value: string): Promise<string> {
    return value.trim();
  }
}
