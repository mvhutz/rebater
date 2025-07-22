import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from ".";
import { State } from "../information/State";

/** ------------------------------------------------------------------------- */

export class EqualsRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("equals"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new EqualsRow(s.with));

  private readonly other: BaseRow[];

  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, state: State): Promise<string> {
    const other_value = await runMany(this.other, row, state);
    return (value === other_value).toString();
  }
}
