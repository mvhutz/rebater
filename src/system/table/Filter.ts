import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany } from "../row";
import { rewire } from "../util";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class FilterTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("filter"),
    criteria: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new FilterTable(s.criteria));

  private readonly criteria: BaseRow[];

  public constructor(criteria: BaseRow[]) {
    this.criteria = criteria;
  }

  async run(table: Table, runner: Runner): Promise<Table> {
    const rows = new Array<Row>();
    for (const row of table.data) {
      const value = await runMany(this.criteria, row, runner);
      if (value === "true") rows.push(row);
    }

    return rewire({ ...table, data: rows });
  }

  buildXML(from: XMLElement): void {
    const parent = from.element("filter");

    for (const criterion of this.criteria) {
      criterion.buildXML(parent);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("filter",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(({ children: c }) => new FilterTable(c))
}