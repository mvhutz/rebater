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

export interface BaseTable {
  run(table: Table, runner: Runner): Promise<Table>;
  buildXML(from: XMLElement): void;
}

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

export async function runMany(rows: BaseTable[], table: Table, runner: Runner) {
  for (const operation of rows) {
    table = await operation.run(table, runner);
  }

  return table;
}

