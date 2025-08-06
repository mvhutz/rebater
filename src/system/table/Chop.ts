import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, rewire } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Chops a table in two, given specific criteria.
 * 
 * Given a table, finds the first row such that `column` is one of `is`. Then,
 * assuming it finds a row, it chooses to `keep` either the `"top"` or `"bottom"`
 * of the table (not including the found row).
 * 
 * If it cannot find a row, it `otherwise` chooses to either `"drop"` the entire
 * table, or `"take"` it and leave it as is.
 */
export class ChopTable implements BaseTable {
  /** The column to check. */
  private readonly column: number;
  /** The list of values that the column must match. */
  private readonly is: string[];
  /** Whether to keep the top or bottom of the table. */
  private readonly keep: "top" | "bottom";
  /** Whether to discard to entire table or not, if a row cannot be found. */
  private readonly otherwise: "drop" | "take";

  /**
   * Create a chop operation.
   * @param column The column to check.
   * @param is The list of values that the column must match.
   * @param keep Whether to keep the top or bottom of the table.
   * @param otherwise Whether to discard to entire table or not, if a row cannot be found.
   */
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

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("chop"),
    column: ExcelIndexSchema,
    is: z.array(z.string()),
    keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
    otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
  }).transform(s => new ChopTable(s.column, s.is, s.keep, s.otherwise));

  buildXML(from: XMLElement): void {
    from.element("chop", {
      column: getExcelFromIndex(this.column),
      is: this.is.join(","),
      keep: this.keep,
      otherwise: this.otherwise,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("chop",
    z.strictObject({
      column: ExcelIndexSchema,
      is: z.string().default("").transform(s => s.split(",").filter(Boolean)),
      keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
      otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
    }),
    z.undefined())
    .transform(({ attributes: a }) => new ChopTable(a.column, a.is, a.keep, a.otherwise))
}
