import { z } from "zod/v4";
import { ExcelIndexSchema, rewire } from "../util";
import { BaseTable } from ".";

/** ------------------------------------------------------------------------- */

export class ChopTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("chop"),
    column: ExcelIndexSchema,
    is: z.array(z.string()),
    keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
    otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
  }).transform(s => new ChopTable(s.column, s.is, s.keep, s.otherwise));

  private readonly column: number;
  private readonly is: string[];
  private readonly keep: "top" | "bottom";
  private readonly otherwise: "drop" | "take";

  public constructor(column: number, is: string[], keep: "top" | "bottom", otherwise: "drop" | "take") {
    this.column = column;
    this.is = is;
    this.keep = keep;
    this.otherwise = otherwise;
  }

  async run(table: Table): Promise<Table> {
    const index = table.data.findIndex(row => this.is.includes(row.data[this.column].trim()));
    if (index === -1) {
      if (this.otherwise === "take") {
        return table;
      } else {
        return { ...table, data: [] };
      }
    }

    const data = this.keep === "top"
        ? table.data.slice(undefined, index)
        : table.data.slice(index, undefined);

    return rewire({ ...table, data });
  }
}
