import { z } from "zod/v4";
import { CoerceDateRow } from "./CoerceDate";
import { CoerceNumberRow } from "./CoerceNumber";
import { CoerceUSDRow } from "./CoerceUSD";
import { BaseRow } from "..";

/** ------------------------------------------------------------------------- */

/** All valid JSON coerce operations. */
export function getCoerceSchema(): z.ZodType<BaseRow> {
  return z.union([
    CoerceDateRow.SCHEMA,
    CoerceNumberRow.SCHEMA,
    CoerceUSDRow.SCHEMA
  ])
}

/** All valid XML coerce operations. */
export function getCoerceXMLSchema(): z.ZodType<BaseRow> {
  return z.union([
    CoerceDateRow.XML_SCHEMA,
    CoerceNumberRow.XML_SCHEMA,
    CoerceUSDRow.XML_SCHEMA
  ])
}
