import { z } from "zod/v4";
import { ColumnRow } from "./Column";
import { LiteralRow } from "./Literal";
import { ReplaceRow } from "./Replace";
import { ReferenceRow } from "./Reference";
import { TrimRow } from "./Trim";
import { CharacterRow } from "./Character";
import { CounterRow } from "./Counter";
import { MultiplyRow } from "./Multiply";
import { MetaRow } from "./Meta";
import { AddRow } from "./Add";
import { EqualsRow } from "./Equals";
import { ConcatRow } from "./Concat";
import { DivideRow } from "./Divide";
import { SumRow } from "./Sum";
import { getCoerceSchema, getCoerceXMLSchema } from "./Coerce";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { UtilityRow } from "./Utility";
import { SubtractRow } from "./Subtract";
import { SearchRow } from "./Search";
import { SignumRow } from "./Sign";
import { AbsoluteRow } from "./Absolute";

/** ------------------------------------------------------------------------- */

/**
 * A row operation.
 * 
 * Given a value (and a row as context), modify that value.
 */
export interface BaseRow {
  /**
   * Run the operation.
   * @param value The value to modify.
   * @param row The row as context.
   * @param runner The running context.
   */
  run(value: string, row: Row, runner: Runner): Promise<Maybe<string>>;

  /**
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  buildXML(from: XMLElement): void;
}

/** All valid JSON row operations. */
export const ROW_SCHEMA: z.ZodType<BaseRow> = z.union([
  getCoerceSchema(),
  ColumnRow.SCHEMA,
  CounterRow.SCHEMA,
  LiteralRow.SCHEMA,
  ReplaceRow.SCHEMA,
  TrimRow.SCHEMA,
  ReferenceRow.SCHEMA,
  CharacterRow.SCHEMA,
  MultiplyRow.SCHEMA,
  MetaRow.SCHEMA,
  AddRow.SCHEMA,
  EqualsRow.SCHEMA,
  ConcatRow.SCHEMA,
  DivideRow.SCHEMA,
  SumRow.SCHEMA,
  UtilityRow.SCHEMA,
  SubtractRow.SCHEMA,
  SearchRow.SCHEMA,
  SignumRow.SCHEMA,
  AbsoluteRow.SCHEMA,
]);

/** All valid XML row operations. */
export const ROW_XML_SCHEMA: z.ZodType<BaseRow> = z.union([
  getCoerceXMLSchema(),
  ColumnRow.XML_SCHEMA,
  CounterRow.XML_SCHEMA,
  LiteralRow.XML_SCHEMA,
  ReplaceRow.XML_SCHEMA,
  TrimRow.XML_SCHEMA,
  ReferenceRow.XML_SCHEMA,
  CharacterRow.XML_SCHEMA,
  MultiplyRow.XML_SCHEMA,
  MetaRow.XML_SCHEMA,
  AddRow.XML_SCHEMA,
  EqualsRow.XML_SCHEMA,
  ConcatRow.XML_SCHEMA,
  DivideRow.XML_SCHEMA,
  SumRow.XML_SCHEMA,
  UtilityRow.XML_SCHEMA,
  SubtractRow.XML_SCHEMA,
  SearchRow.XML_SCHEMA,
  SignumRow.XML_SCHEMA,
  AbsoluteRow.XML_SCHEMA,
]);

export async function runMany(rows: BaseRow[], row: Row, runner: Runner): Promise<Maybe<string>> {
  let value = "";

  for (const operation of rows) {
    const result = await operation.run(value, row, runner);
    if (result == null) return result;
    value = result;
  }

  return value;
}
