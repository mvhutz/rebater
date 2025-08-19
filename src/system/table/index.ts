import { z } from "zod/v4";
import { ChopTable, ChopTableData } from "./Chop";
import { CoalesceTable, CoalesceTableData } from "./Coalesce";
import { DebugTable, DebugTableData } from "./Debug";
import { FilterTable, FilterTableData } from "./Filter";
import { HeaderTable, HeaderTableData } from "./Header";
import { PercolateTable, PercolateTableData } from "./Percolate";
import { SelectTable, SelectTableData } from "./Select";
import { SetTable, SetTableData } from "./Set";
import { TrimTable, TrimTableData } from "./Trim";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * A table operation.
 * 
 * Given a certain resulting table, figure out where to store it.
 */
export abstract class BaseTable {
  /**
   * Run the operation.
   * @param table The table to modify.
   * @param runner The running context.
   */
  abstract run(table: Table, runner: Runner): Table;

  /**
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  abstract buildXML(from: XMLElement): void;

  abstract buildJSON(): TableData;

  /**
   * Run a set of table operations in succession.
   * @param rows The table operations.
   * @param table The table to begin with.
   * @param runner The running context.
   * @returns A modified table.
   */
  static runMany(rows: BaseTable[], table: Table, runner: Runner) {
    for (const operation of rows) {
      table = operation.run(table, runner);
    }

    return table;
  }
}

export type TableData =
  | ChopTableData
  | CoalesceTableData
  | DebugTableData
  | FilterTableData
  | HeaderTableData
  | PercolateTableData
  | SelectTableData
  | SetTableData
  | TrimTableData;

/** All possible JSON operations. */
export const TABLE_SCHEMA: z.ZodType<BaseTable, TableData> = z.union([
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

