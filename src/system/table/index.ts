import { z } from "zod/v4";
import { ChopTable } from "./Chop";
import { CoalesceTable } from "./Coalesce";
import { DebugTable } from "./Debug";
import { FilterTable } from "./Filter";
import { HeaderTable } from "./Header";
import { PercolateTable } from "./Percolate";
import { SelectTable } from "./Select";
import { SetTable } from "./Set";
import { TrimTable } from "./Trim";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

/**
 * A table operation.
 * 
 * Given a certain resulting table, figure out where to store it.
 */
export interface BaseTable {
  /**
   * Run the operation.
   * @param table The table to modify.
   * @param runner The running context.
   */
  run(table: Table, runner: Runner): Promise<Table>;

  /**
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  buildXML(from: XMLElement): void;
}

/** All possible JSON operations. */
export const TABLE_SCHEMA: z.ZodType<BaseTable> = z.union([
  ChopTable.SCHEMA,
  CoalesceTable.SCHEMA,
  DebugTable.SCHEMA,
  FilterTable.SCHEMA,
  HeaderTable.SCHEMA,
  PercolateTable.SCHEMA,
  SelectTable.SCHEMA,
  SetTable.SCHEMA,
  TrimTable.SCHEMA
]);

/** All possible XML operations. */
export const TABLE_XML_SCHEMA: z.ZodType<BaseTable> = z.union([
  ChopTable.XML_SCHEMA,
  CoalesceTable.XML_SCHEMA,
  DebugTable.XML_SCHEMA,
  FilterTable.XML_SCHEMA,
  HeaderTable.XML_SCHEMA,
  PercolateTable.XML_SCHEMA,
  SelectTable.XML_SCHEMA,
  SetTable.XML_SCHEMA,
  TrimTable.XML_SCHEMA
]);

/**
 * Run a set of table operations in succession.
 * @param rows The table operations.
 * @param table The table to begin with.
 * @param runner The running context.
 * @returns A modified table.
 */
export async function runMany(rows: BaseTable[], table: Table, runner: Runner) {
  for (const operation of rows) {
    table = await operation.run(table, runner);
  }

  return table;
}

