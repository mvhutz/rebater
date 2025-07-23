import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from ".";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export class MultiplyRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("multiply"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new MultiplyRow(s.with));

  private readonly other: BaseRow[];

  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, state: State): Promise<string> {
    const other_value = await runMany(this.other, row, state);
    return (Number(value) * Number(other_value)).toString();
  }
}
