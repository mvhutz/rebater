import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from ".";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface SubtractRowData {
  type: "subtract";
  with: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Subtract the current value, with the result of another set of row
 * transformations.
 */
export class SubtractRow implements BaseRow {
  /** The other set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create a subtract operation.
   * @param other THe other set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (Number(value) - Number(other_value)).toString();
  }

  buildJSON(): SubtractRowData {
    return { type: "subtract", with: this.other.map(o => o.buildJSON()) };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, SubtractRowData> = z.strictObject({
    type: z.literal("subtract"),
    with: z.lazy(() => z.array(ROW_SCHEMA))
  }).transform(s => new SubtractRow(s.with));
}
