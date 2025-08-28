import z from "zod/v4";
import { AdvancedTransformerData, AdvancedTransformerSchema } from "./advanced";
import { SimpleTransformerData, SimpleTransformerSchema } from "./simple";

/** ------------------------------------------------------------------------- */

export type TransformerData =
  | AdvancedTransformerData
  | SimpleTransformerData;

export const TransformerSchema = z.discriminatedUnion("type", [
  AdvancedTransformerSchema,
  SimpleTransformerSchema
])