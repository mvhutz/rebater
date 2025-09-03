import z from "zod/v4";
import { TableData, TableSchema } from "./advanced";

export interface SimpleTransformerData {
  type: "simple";
  name: string;
  group: string;
  source: {
    sheets: string[];
    file: string;
    trim: {
      top: number;
      bottom: number;
    }
  }
  properties: {
    purchaseId: "counter";
    transactionDate: { column: number; parse?: string; };
    supplierId: { value: string; }
    memberId: { column: number; }
    distributorName:
      | { type: "name", value: string; }
      | { type: "column", value: number; }
    purchaseAmount: { column: number; };
    rebateAmount: { column: number; multiplier: number; };
    invoiceId: { column: number; };
    invoiceDate: { column: number; parse?: string; };
  }
  options: {
    canadian_rebate: boolean,
    remove_null_rebates: boolean;
    additional_preprocessing: TableData[];
    additional_postprocessing: TableData[];
  }
}

export const SimpleTransformerSchema = z.strictObject({
  type: z.literal("simple"),
  name: z.string(),
  group: z.string(),
  source: z.strictObject({
    sheets: z.array(z.string()),
    file: z.string(),
    trim: z.strictObject({
      top: z.number().int().nonnegative(),
      bottom: z.number().int().nonnegative()
    }).default({ top: 0, bottom: 0 })
  }),
  properties: z.strictObject({
    purchaseId: z.literal("counter"),
    transactionDate: z.strictObject({
      column: z.number(),
      parse: z.string().optional() }),
    supplierId: z.strictObject({
      value: z.string()
    }),
    memberId: z.strictObject({
      column: z.number()
    }),
    distributorName: z.discriminatedUnion("type", [
      z.strictObject({
        type: z.literal("name"),
        value: z.string()
      }),
      z.strictObject({
        type: z.literal("column"),
        value: z.number()
      }),
    ]).catch({ type: "name", value: "" }),
    purchaseAmount: z.strictObject({
      column: z.number()
    }),
    rebateAmount: z.strictObject({
      column: z.number(),
      multiplier: z.number().default(1)
    }),
    invoiceId: z.strictObject({
      column: z.number()
    }),
    invoiceDate: z.strictObject({
      column: z.number(),
      parse: z.string().optional()
    }),
  }),
  options: z.strictObject({
    canadian_rebate: z.boolean(),
    remove_null_rebates: z.boolean(),
    additional_preprocessing: z.array(TableSchema).catch([]),
    additional_postprocessing: z.array(TableSchema).catch([]),
  }),
}) satisfies z.ZodType<SimpleTransformerData>;
