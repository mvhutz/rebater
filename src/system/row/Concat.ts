import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from ".";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface ConcatRowData {
  type: "concat";
  with: RowData[];
  separator?: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Concatenate one string with the value from another set of row
 * transformations.
 * 
 * Optionally, you can set a separator value to go in-between the two values.
 */
export class ConcatRow implements BaseRow {
  /** The set of row transformations to extract the second value. */
  private readonly other: BaseRow[];
  /** The separator between the two values. */
  private readonly separator: string;

  /**
   * Create a concat operation.
   * @param other The set of row transformations to extract the second value.
   * @param separator The separator between the two values.
   */
  public constructor(other: BaseRow[], separator: string) {
    this.other = other;
    this.separator = separator;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return value + this.separator + other_value;
  }

  buildJSON(): ConcatRowData {
    return { type: "concat", with: this.other.map(o => o.buildJSON()), separator: this.separator };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, ConcatRowData> = z.strictObject({
    type: z.literal("concat"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
    separator: z.string().default("")
  }).transform(s => new ConcatRow(s.with, s.separator));
}
