import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, getTrueIndex, makeTable } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class PercolateTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("percolate"),
    columns: z.array(ExcelIndexSchema),
    matches: z.array(z.string()).default([""])
  }).transform(s => new PercolateTable(s.columns, s.matches));

  private readonly columns: number[];
  private readonly matches: string[];

  public constructor(columns: number[], matches: string[]) {
    this.columns = columns;
    this.matches = matches;
  }

  async run(table: Table): Promise<Table> {
    let previous: Maybe<string[]>;
    const rows = new Array<string[]>();

    for (const row of table.data) {
      const cells = [...row.data];

      for (const index of this.columns) {
        if (this.matches.includes(cells[index])) {
          if (previous == null) continue;
          cells[index] = previous[index];
        }
      }

      previous = cells;
      rows.push(cells);
    }

    return makeTable(rows, table.path);
  }

  buildXML(from: XMLElement): void {
    from.element("percolate", {
      columns: this.columns.map(getExcelFromIndex).join(","),
      matches: this.matches.join(",")
    });
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("percolate",
    z.strictObject({
      columns: z.string().default("").transform(s => s.split(",").filter(Boolean).map(getTrueIndex)),
      matches: z.string().default("").transform(s => s.split(",")),
      action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new PercolateTable(a.columns, a.matches))
}
