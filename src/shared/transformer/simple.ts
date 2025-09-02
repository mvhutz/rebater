import z from "zod/v4";

export interface SimpleTransformerData {
  type: "simple";
  name: string;
  group: string;
  source: {
    sheets: string[];
    file?: string;
    trim: {
      top: number;
      bottom: number;
    }
  }
  properties: {
    purchaseId: "counter";
    transactionDate: { column?: number; parse?: string; };
    supplierId: { value?: string; }
    memberId: { column?: number; }
    distributorName:
      | { type: "value", value?: string; }
      | { type: "column", column?: number; }
    purchaseAmount: { column?: number; };
    rebateAmount: { column?: number; multiplier?: number; };
    invoiceId: { column?: number; };
    invoiceDate: { column?: number; parse?: string; };
  }
  options: {
    canadian_rebate: boolean,
    remove_null_rebates: boolean;
    additional_preprocessing?: string;
    additional_postprocessing?: string;
  }
}

export const SimpleTransformerSchema: z.ZodObject & z.ZodType<SimpleTransformerData> = z.strictObject({
  type: z.literal("simple"),
  name: z.string(),
  group: z.string(),
  source: z.strictObject({
    sheets: z.array(z.string()),
    file: z.string().optional(),
    trim: z.strictObject({
      top: z.coerce.number().int("Cannot trim header by a fractional amount!").nonnegative("Cannot trim header by a negative amount."),
      bottom: z.coerce.number().int("Cannot trim footer by a fractional amount!").nonnegative("Cannot trim footer by a negative amount.")
    }).default({ top: 0, bottom: 0 })
  }),
  properties: z.strictObject({
    purchaseId: z.literal("counter"),
    transactionDate: z.strictObject({ column: z.number().optional(), parse: z.string().optional() }),
    supplierId: z.strictObject({ value: z.string().optional() }),
    memberId: z.strictObject({ column: z.number().optional() }),
    distributorName: z.discriminatedUnion("type", [
      z.strictObject({ type: z.literal("value"), value: z.string().optional() }),
      z.strictObject({ type: z.literal("column"), column: z.number().optional() }),
    ]),
    purchaseAmount: z.strictObject({ column: z.number().optional() }),
    rebateAmount: z.strictObject({ column: z.number().optional(), multiplier: z.number().optional() }),
    invoiceId: z.strictObject({ column: z.number().optional() }),
    invoiceDate: z.strictObject({ column: z.number().optional(), parse: z.string().optional() }),
  }),
  options: z.strictObject({
    canadian_rebate: z.boolean(),
    remove_null_rebates: z.boolean(),
    additional_preprocessing: z.string().optional(),
    additional_postprocessing: z.string().optional(),
  }),
});