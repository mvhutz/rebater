import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from ".";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export class ConcatRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("concat"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
    separator: z.string().default("")
  }).transform(s => new ConcatRow(s.with, s.separator));

  private readonly other: BaseRow[];
  private readonly separator: string;

  public constructor(other: BaseRow[], separator: string) {
    this.other = other;
    this.separator = separator;
  }

  async run(value: string, row: Row, state: State): Promise<string> {
    const other_value = await runMany(this.other, row, state);
    return other_value + this.separator + value;
  }
}
