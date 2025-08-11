import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from "../row";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Sets a specific columns value.
 * 
 * For each row, a set of row transformations are performed on it. The resulting
 * value is put into a specific column cell of that row.
 */
export class SetTable implements BaseTable {
  /** The column cell to put the value in. */
  private readonly column: number;
  /** The set of row transformations. */
  private readonly to: BaseRow[];

  /**
   * Create a set operation.
   * @param column The column cell to put the value in.
   * @param to The set of row transformations.
   */
  public constructor(column: number, to: BaseRow[]) {
    this.column = column;
    this.to = to;
  }

  async run(table: Table, runner: Runner): Promise<Table> {
    return table.updateAsync(async r => {
      const value = await BaseRow.runMany(this.to, r, runner, table);
      if (value == null) return null;

      return r.set(this.column, value);
    });
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("set"),
    column: ExcelIndexSchema,
    to: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new SetTable(s.column, s.to));


  buildXML(from: XMLElement): void {
    const parent = from.element("set", {
      column: getExcelFromIndex(this.column),
    });

    for (const t of this.to) {
      t.buildXML(parent);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("set",
    z.strictObject({
      column: ExcelIndexSchema,
    }),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(({ children: c, attributes: a }) => new SetTable(a.column, c))
}
