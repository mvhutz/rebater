import { z } from "zod/v4";
import { CoerceDateRow } from "./CoerceDate";
import { CoerceNumberRow } from "./CoerceNumber";
import { CoerceUSDRow } from "./CoerceUSD";
import { BaseRow } from "..";

/** ------------------------------------------------------------------------- */

export function getCoerceSchema(): z.ZodType<BaseRow> {
  return z.union([
    CoerceDateRow.SCHEMA,
    CoerceNumberRow.SCHEMA,
    CoerceUSDRow.SCHEMA
  ])
}

export function getCoerceXMLSchema(): z.ZodType<BaseRow> {
  return z.union([
    CoerceDateRow.XML_SCHEMA,
    CoerceNumberRow.XML_SCHEMA,
    CoerceUSDRow.XML_SCHEMA
  ])
}
