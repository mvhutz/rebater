import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, RowData } from ".";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface AddRowData {
  type: "add";
  with: RowData[];
}

/** ------------------------------------------------------------------------- */

/**
 * Add another value to the current value, based on another set of row
 * transformations.
 */
export class AddRow implements BaseRow {
  /** The other row transformations, whose result will be added. */
  private readonly other: BaseRow[];

  /**
   * Create an add operation.
   * @param other The other row transformations, whose result will be added.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (Number(value) + Number(other_value)).toString();
  }

  buildJSON(): AddRowData {
    return {
      type: "add",
      with: this.other.map(o => o.buildJSON())
    }
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("add"),
    with: z.lazy(() => z.array(ROW_SCHEMA))
  }).transform(s => new AddRow(s.with));
}
