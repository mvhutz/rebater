import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex, rewire } from "../util";
import { BaseTable } from ".";
import assert from "assert";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class CoalesceTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("coalesce"),
    match: z.array(ExcelIndexSchema),
    combine: z.array(ExcelIndexSchema).default([])
  }).transform(s => new CoalesceTable(s.match, s.combine));

  private readonly match: number[];
  private readonly combine: number[];

  public constructor(match: number[], combine: number[]) {
    this.match = match;
    this.combine = combine;
  }

  getHash(row: Row) {
    const array = this.match.map(m => row.data[m]);
    return JSON.stringify(array);
  }

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

    const combined = [...matched.values()].map(r => this.combineRows(r));
    return rewire({ ...table, data: combined });
  }

  build(from: XMLElement): void {
    from.element("coalesce", {
      match: this.match.map(getExcelFromIndex).join(","),
      combine: this.combine.map(getExcelFromIndex).join(",")
    });
  }
}