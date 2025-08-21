import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from ".";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface MultiplyRowData {
  type: "multiply",
  with: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Multiply the current value with the result of anotehr set of row transformations.
 */
export class MultiplyRow implements BaseRow {
  /** The set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create a multiply operation.
   * @param other The set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (Number(value) * Number(other_value)).toString();
  }

  buildJSON(): MultiplyRowData {
    return { type: "multiply", with: this.other.map(o => o.buildJSON()) };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, MultiplyRowData> = z.strictObject({
    type: z.literal("multiply"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new MultiplyRow(s.with));
}
