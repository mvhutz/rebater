import { z } from "zod/v4";
import { ColumnRow, ColumnRowData } from "./Column";
import { LiteralRow, LiteralRowData } from "./Literal";
import { ReplaceRow, ReplaceRowData } from "./Replace";
import { ReferenceRow, ReferenceRowData } from "./Reference";
import { TrimRow, TrimRowData } from "./Trim";
import { CharacterRow, CharacterRowData } from "./Character";
import { CounterRow, CounterRowData } from "./Counter";
import { MultiplyRow, MultiplyRowData } from "./Multiply";
import { MetaRow, MetaRowData } from "./Meta";
import { AddRow, AddRowData } from "./Add";
import { EqualsRow, EqualsRowData } from "./Equals";
import { ConcatRow, ConcatRowData } from "./Concat";
import { DivideRow, DivideRowData } from "./Divide";
import { SumRow, SumRowData } from "./Sum";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { UtilityRow, UtilityRowData } from "./Utility";
import { SubtractRow, SubtractRowData } from "./Subtract";
import { SearchRow, SearchRowData } from "./Search";
import { SignumRow, SignumRowData } from "./Sign";
import { AbsoluteRow, AbsoluteRowData } from "./Absolute";
import { Row, Table } from "../information/Table";
import { CoerceNumberRow, CoerceNumberRowData } from "./CoerceNumber";
import { CoerceDateRow, CoerceDateRowData } from "./CoerceDate";
import { CoerceUSDRow, CoerceUSDRowData } from "./CoerceUSD";

/** ------------------------------------------------------------------------- */

/**
 * A row operation.
 * 
 * Given a value (and a row as context), modify that value.
 */
export abstract class BaseRow {
  /**
   * Run the operation.
   * @param value The value to modify.
   * @param row The row as context.
   * @param runner The running context.
   */
  abstract run(value: string, row: Row, runner: Runner, table: Table): Maybe<string>;

  /**
   * Add this tag to an XML document.
   * @param from The document to append to.
   */
  abstract buildXML(from: XMLElement): void;

  abstract buildJSON(): RowData;

  static runMany(rows: BaseRow[], row: Row, runner: Runner, table: Table): Maybe<string> {
    let value = "";

    for (const operation of rows) {
      const result = operation.run(value, row, runner, table);
      if (result == null) return result;
      value = result;
    }

    return value;
  }
}

/** ------------------------------------------------------------------------- */

export type RowData =
  | CoerceDateRowData
  | CoerceNumberRowData
  | CoerceUSDRowData
  | AbsoluteRowData
  | AddRowData
  | CharacterRowData
  | ColumnRowData
  | ConcatRowData
  | CounterRowData
  | DivideRowData
  | EqualsRowData
  | LiteralRowData
  | MetaRowData
  | MultiplyRowData
  | ReferenceRowData
  | ReplaceRowData
  | SearchRowData
  | SignumRowData
  | SubtractRowData
  | SumRowData
  | TrimRowData
  | UtilityRowData;

/** All valid JSON row operations. */
export const ROW_SCHEMA: z.ZodType<BaseRow, RowData> = z.union([
  CoerceDateRow.SCHEMA,
  CoerceNumberRow.SCHEMA,
  CoerceUSDRow.SCHEMA,
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
  CoerceDateRow.XML_SCHEMA,
  CoerceNumberRow.XML_SCHEMA,
  CoerceUSDRow.XML_SCHEMA,
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
