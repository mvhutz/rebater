import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, rewire } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class SelectTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("select"),
    column: ExcelIndexSchema,
    is: z.string(),
    action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
  }).transform(s => new SelectTable(s.column, s.action, s.is));

  private readonly column: number;
  private readonly is: string;
  private readonly action: "drop" | "keep";

  public constructor(column: number, action: "drop" | "keep", is: string) {
    this.column = column;
    this.action = action;
    this.is = is;
  }

  async run(table: Table): Promise<Table> {
    const rows = table.data.filter(row => {
      const datum = row.data[this.column];
      return (this.action === "keep") === (this.is === datum);
    });

    return rewire({ ...table, data: rows });
  }

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
