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
import { getCoerceSchema } from "./Coerce";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export interface BaseRow {
  run(value: string, row: Row, runner: Runner): Promise<Maybe<string>>;
  buildXML(from: XMLElement): void;
}

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
  SumRow.SCHEMA
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
