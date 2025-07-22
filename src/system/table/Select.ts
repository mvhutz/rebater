import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../util";
import { BaseTable } from ".";

/** ------------------------------------------------------------------------- */

export class SelectTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("select"),
    column: ExcelIndexSchema,
    is: z.union([z.string(), z.array(z.string())]).optional(),
    isnt: z.union([z.string(), z.array(z.string())]).optional(),
    action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
  }).transform(s => new SelectTable(s.column, s.action, s.is, s.isnt));

  private readonly column: number;
  private readonly is?: string[];
  private readonly isnt?: string[];
  private readonly action: "drop" | "keep";

  public constructor(column: number, action: "drop" | "keep", is?: string | string[], isnt?: string | string[]) {
    this.column = column;
    this.action = action;
    this.is = is == null || Array.isArray(is) ? is : [is];
    this.isnt = isnt == null || Array.isArray(isnt) ? isnt : [isnt];
  }

  async run(table: Table): Promise<Table> {
    const rows = table.data.filter(row => {
      const datum = row.data[this.column];
      return (this.action === "keep") === (this.is?.includes(datum) || (this.isnt != null && !this.isnt.includes(datum)));
    });

    return rewire({ ...table, data: rows });
  }
}
