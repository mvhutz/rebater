import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, getTrueIndex, rewire } from "../util";
import { BaseTable } from ".";
import assert from "assert";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Combines specific rows.
 * 
 * This operation sorts all rows in the table into buckets, based on the values
 * of certain `match` columns in the rows.
 * 
 * Then, for each bucket, it takes the rows inside, and collects the sums of
 * certain `combine` columns, and creates a "super" column which contains these
 * sums.
 * 
 * Then, it collects these "super" rows, and returns them as a table.
 */
export class CoalesceTable implements BaseTable {
  /** The columns which the rows should be matched on. */
  private readonly match: number[];
  /** The columns which should be summed, when within the buckets. */
  private readonly combine: number[];

  /**
   * Create a coalesce operation.
   * @param match The columns which the rows should be matched on.
   * @param combine The columns which should be summed, when within the buckets.
   */
  public constructor(match: number[], combine: number[]) {
    this.match = match;
    this.combine = combine;
  }

  /**
   * Create a hash s.t. any other row which should be in the same bucket, has
   * the same hash.
   * @param row The row to be hashed.
   * @returns The hash.
   */
  getHash(row: Row) {
    const array = this.match.map(m => row.data[m]);
    return JSON.stringify(array);
  }

  /**
   * Combine a set of rows.
   * @param rows The rows to combine.
   * @returns A single row, containing all summed columns, and otherwise, the
   * column values of the first row.
   */
  combineRows(rows: Row[]) {
    const result = structuredClone(rows.pop());
    assert.ok(result != null, "Cannot coalesce empty set of arrays.");

    for (const row of rows) {
      for (const index of this.combine) {
        result.data[index] = (Number(row.data[index]) + Number(result.data[index])).toString()
      }
    }

    return result;
  }

  async run(table: Table): Promise<Table> {
    // Create the buckets.
    const matched = new Map<string, Row[]>();
    for (const row of table.data) {
      const hash = this.getHash(row);
      const list = matched.get(hash);

      if (list == null) {
        matched.set(hash, [row]);
      } else {
        list.push(row);
      }
    }

    // Combine the buckets.
    const combined = [...matched.values()].map(r => this.combineRows(r));
    return rewire({ ...table, data: combined });
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("coalesce"),
    match: z.array(ExcelIndexSchema),
    combine: z.array(ExcelIndexSchema).default([])
  }).transform(s => new CoalesceTable(s.match, s.combine));

  buildXML(from: XMLElement): void {
    from.element("coalesce", {
      match: this.match.map(getExcelFromIndex).join(","),
      combine: this.combine.map(getExcelFromIndex).join(",")
    });
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("coalesce",
    z.strictObject({
      match: z.string().default("").transform(s => s.split(",").filter(Boolean).map(getTrueIndex)),
      combine: z.string().default("").transform(s => s.split(",").filter(Boolean).map(getTrueIndex)),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new CoalesceTable(a.match, a.combine))
}