import { z } from "zod/v4";
import { BaseTable } from ".";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface HeaderTableData {
  type:"header";
  names: string[];
  action: "drop" | "keep";
}

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

  run(table: Table): Table {
    const rotated = table.transpose();

    if (this.action === "drop") {
      const columns = rotated.filter(c => !this.names.includes(c.get(0) ?? ""));
      return columns.transpose();
    }
    
    else {
      const columns = this.names
        .map(n => rotated.split().find(c => c.get(0) === n))
        .filter(c => c != null);

      return Table.join(...columns).transpose();
    }
  }

  buildJSON(): HeaderTableData {
    return { type: "header", names: this.names, action: this.action };
  }

  public static readonly SCHEMA: z.ZodType<BaseTable, HeaderTableData> = z.strictObject({
    type: z.literal("header"),
    names: z.array(z.string()),
    action: z.union([z.literal("drop"), z.literal("keep")]),
  }).transform(s => new HeaderTable(s.names, s.action));
}