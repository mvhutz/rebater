import { z } from "zod/v4";
import { rewire } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Alter the available columns, based on the values within the first row
 * (header).
 * 
 * If the user acts to `"keep"` the chosen `names`, then:
 * - The operations goes through the list of names, sequentially.
 * - For each name, it finds the first column s.t. its first row matches the
 *   name. It places the entire column into a resulting table.
 * - If no column is found, it does not place a column.
 * - After all columns are found, they are combined (in the order that the names
 *   where specified), and returned as a table.
 * 
 * If the user acts to `"drop"` the chosen `name`, then:
 * - The operations goes through the list of names, sequentially.
 * - For each name, find all columns which contain that name in the first row.
 * - Delete those columns.
 * - Return the resulting table.
 */
export class HeaderTable implements BaseTable {
  /** The names of the headers to search for. */
  private readonly names: string[];
  /** Whether to keep the found columns, or drop them. */
  private readonly action: "drop" | "keep";

  /**
   * Create a header operation.
   * @param names The names of the headers to search for.
   * @param action Whether to keep the found columns, or drop them.
   */
  public constructor(names: string[], action: "drop" | "keep") {
    this.names = names;
    this.action = action;
  }

  /**
   * Find the first column whose first row matches the name.
   * @param name The name to search for.
   * @param table The table to search in.
   * @returns The column, represented as a table.
   */
  private takeRow(name: string, table: Table) {
    const index = table.data[0].data.findIndex(r => r === name);
    if (index === -1) return null;

    const rows = table.data.map(r => ({
      ...r,
      data: [r.data[index]]
    }));

    return rewire({ ...table, data: rows });
  }

  /**
   * Combine a set of tables, left to right.
   * @param a The left table.
   * @param b The right table.
   * @returns The combined table.
   */
  private combineColumns(a: Table, b: Table) {
    const rows: Row[] = [];

    for (let i = 0; i < a.data.length; i++) {
      const a_row = a.data[i];
      const b_row = b.data[i];
      rows.push({ table: a, data: a_row.data.concat(b_row.data) });
    }

    return rewire({ path: a.path, data: rows });
  }

  /**
   * Find all columns whose first row matches a name, and delete those columns.
   * @param name The name to match for.
   * @param table The table to delete in.
   * @returns A new table, with the matching columns deleted.
   */
  private dropRow(name: string, table: Table) {
    const index = table.data[0].data.findIndex(r => r === name);
    if (index === -1) return table;

    const rows = table.data.map(r => ({
      ...r,
      data: r.data.toSpliced(index, 1)
    }));

    return rewire({ ...table, data: rows });
  }

  async run(table: Table): Promise<Table> {
    if (this.action === "drop") {
      let result = table;

      for (const name of this.names) {
        result = this.dropRow(name, table);
      }
      
      return rewire(result);
    } else {
      let result: Table = { path: table.path, data: table.data.map(() => ({ table: table, data: [] })) };
      for (const name of this.names) {
        const next = this.takeRow(name, table);
        if (next == null) continue;
        result = this.combineColumns(result, next);
      }

      return rewire(result);
    }
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("header"),
    names: z.array(z.string()),
    action: z.union([z.literal("drop"), z.literal("keep")]),
  }).transform(s => new HeaderTable(s.names, s.action));

  buildXML(from: XMLElement): void {
    const parent = from.element("header", {
      action: this.action,
    });

    for (const name of this.names) {
      parent.element("name", undefined, name);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("header",
    z.strictObject({
      action: z.union([z.literal("drop"), z.literal("keep")]),
    }),
    z.array(
      makeNodeElementSchema("name", z.undefined(), z.tuple([
        makeTextElementSchema(z.string())
      ]))
    ))
    .transform(({ attributes: a, children: c }) => new HeaderTable(c.map(({ children: cx}) => cx[0].text), a.action));
}