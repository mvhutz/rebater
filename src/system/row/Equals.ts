import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from ".";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface EqualsRowData {
  type: "equals";
  with: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Compare the current value with the value of anotehr set of row
 * transformations.
 * 
 * If they equal, this operation returns "true". Otherwise, it returns "false".
 */
export class EqualsRow implements BaseRow {
  /** The other set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create an equals operation.
   * @param other The other set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (value === other_value).toString();
  }

  buildJSON(): EqualsRowData {
    return { type: "equals", with: this.other.map(o => o.buildJSON()) };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, EqualsRowData> = z.strictObject({
    type: z.literal("equals"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new EqualsRow(s.with));
}
