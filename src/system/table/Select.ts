import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Filters rows based on their value in a specific column.
 * 
 * For each row in a table, the operation collects the row if the specified
 * column in that row equals a specific value.
 * 
 * If the user chooses to `"drop"` these rows, there will be deleted, and the
 * remaining rows returned.
 * 
 * If the user chooses to `"keep"` these rows, they will be returned instead,
 * ignoring all other rows.
 */
export class SelectTable implements BaseTable {
  /** The colunm to check. */
  private readonly column: number;
  /** The value to match against. */
  private readonly is: string;
  /** Whether to keep any matching rows, or delete them. */
  private readonly action: "drop" | "keep";

  /**
   * Create a select operation.
   * @param column The colunm to check.
   * @param action The value to match against.
   * @param is Whether to keep any matching rows, or delete them.
   */
  public constructor(column: number, action: "drop" | "keep", is: string) {
    this.column = column;
    this.action = action;
    this.is = is;
  }

  async run(table: Table): Promise<Table> {
    return table.filter(r => {
      return (this.is === r.get(this.column)) === (this.action === "keep");
    });
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("select"),
    column: ExcelIndexSchema,
    is: z.string(),
    action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
  }).transform(s => new SelectTable(s.column, s.action, s.is));

  buildXML(from: XMLElement): void {
    from.element("select", {
      column: getExcelFromIndex(this.column),
      is: this.is,
      action: this.action,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("select",
    z.strictObject({
      column: ExcelIndexSchema,
      is: z.string(),
      action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new SelectTable(a.column, a.action, a.is))
}
