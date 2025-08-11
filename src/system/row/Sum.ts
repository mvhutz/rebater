import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { Row, Table } from "../information/Table";
import { Runner } from "../runner/Runner";
import assert from "assert";

/** ------------------------------------------------------------------------- */

/**
 * Find the combined sum of a specific column of the table that the row is from.
 */
export class SumRow implements BaseRow {
  /** The column to sum. */
  private readonly column: number;

  /** A cache of any previous sums, to meet performance needs. */
  private cache = new WeakMap<Table, Map<number, number>>();

  /**
   * Create a sum operation.
   * @param column The column to be summed.
   */
  public constructor(column: number) {
    this.column = column;
  }

  async run(_value: string, row: Row, _r: Runner, table: Table): Promise<string> {
    // Get table sums.
    let cached_table = this.cache.get(table);
    if (cached_table == null) {
      this.cache.set(table, cached_table = new Map());
    }

    // Get sum.
    const cached_sum = cached_table.get(this.column);
    if (cached_sum != null) return cached_sum.toString();

    // Make sum.
    let sum = 0;
    for (const _row of table.split()) {
      const value = parseFloat(_row.get(this.column) ?? "");
      assert.ok(!isNaN(value), `Value ${_row.get(this.column)} is not a number!`);

      sum += value;
    }

    // Remember sum.
    cached_table.set(this.column, sum);
    return sum.toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("sum"),
    column: ExcelIndexSchema,
  }).transform(s => new SumRow(s.column));

  buildXML(from: XMLElement): void {
    from.element("sum", undefined, getExcelFromIndex(this.column));
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("sum",
    z.undefined(),
    z.tuple([
      makeTextElementSchema(ExcelIndexSchema)
    ]))
    .transform(x => new SumRow(x.children[0].text))
}
