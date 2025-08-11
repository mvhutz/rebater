import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from "../row";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Filters rows, based a certain criteria.
 * 
 * For each row in the table, a set of row transformations are run. If the
 * resulting value is truthy, the row is kept.
 */
export class FilterTable implements BaseTable {
  /** The criteria to check. */
  private readonly criteria: BaseRow[];

  /**
   * Create a filter operation.
   * @param criteria The criteria to check.
   */
  public constructor(criteria: BaseRow[]) {
    this.criteria = criteria;
  }

  run(table: Table, runner: Runner): Table {
    return table.filter(row => {
      const value = BaseRow.runMany(this.criteria, row, runner, table);
      return value === "true";
    });
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("filter"),
    criteria: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new FilterTable(s.criteria));

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