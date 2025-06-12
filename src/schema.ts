import { z } from 'zod/v4';

export const CustomerSchema = z.object({
  supplierName: z.string().nonempty(),
  category: z.string().nonempty(),
  customerName: z.string().nonempty(),
  internalId: z.string().optional(),
  fuseId: z.number().optional(),
});

export const CustomerTableSchema = z.array(CustomerSchema);

export type Customer = z.infer<typeof CustomerSchema>;

const CounterExpressionSchema = z.object({
  type: z.literal("counter"),
  name: z.string(),
})

const ColumnExpressionSchema = z.object({
  type: z.literal("column"),
  index: z.number(),
});

const LiteralExpressionSchema = z.object({
  type: z.literal("literal"),
  value: z.union([z.string(), z.number()]),
});

const EqualExpressionSchema: z.ZodSchema<EqualExpression> = z.object({
  type: z.literal("equal"),
  value: z.lazy(() => z.array(ExpressionSchema)),
});

const CustomerExpressionSchema: z.ZodSchema<CustomerExpression> = z.object({
  type: z.literal("customer"),
  from: CustomerSchema.keyof(),
  to: CustomerSchema.keyof(),
  value: z.lazy(() => ExpressionSchema),
});

const MatchExpressionSchema: z.ZodSchema<MatchExpression> = z.object({
  type: z.literal("match"),
  regex: z.string().optional(),
  value: z.lazy(() => ExpressionSchema),
});

const ExpressionSchema = z.union([
  CounterExpressionSchema,
  ColumnExpressionSchema,
  LiteralExpressionSchema,
  CustomerExpressionSchema,
  MatchExpressionSchema,
  EqualExpressionSchema,
]);

const ExcelSourceSchema = z.object({
  type: z.literal("excel"),
  name: z.string(),
  path: z.string(),
  sheets: z.array(z.string()).optional(),
  rows: z.object({
    from: z.int().optional(),
    to: z.int().optional(),
  }).optional(),
});

export type ExcelSource = z.infer<typeof ExcelSourceSchema>;

const PDFSourceSchema = z.object({
  type: z.literal("pdf"),
  name: z.string(),
  path: z.string(),
  pages: z.array(z.number()).optional(),
  rows: z.object({
    from: z.int().optional(),
    to: z.int().optional(),
  }).optional(),
});

export type PDFSource = z.infer<typeof PDFSourceSchema>;

const SourceSchema = z.union([ExcelSourceSchema, PDFSourceSchema]);
export type Source = z.infer<typeof SourceSchema>;

export const RebateSchema = z.object({
  purchaseId: z.number(),
  transactionDate: z.union([z.date(), z.string()]),
  supplierId: z.number(),
  memberId: z.number(),
  distributorName: z.string(),
  purchaseAmount: z.string(),
  rebateAmount: z.string(),
  invoiceId: z.coerce.number(),
  invoiceDate: z.union([z.date(), z.string()]),
});

export type Rebate = z.infer<typeof RebateSchema>;

export const SupplierSchema = z.object({
  name: z.string(),
  properties: z.partialRecord(RebateSchema.keyof(), z.object({
    type: z.union([z.literal("string"), z.literal("date"), z.literal("number"), z.literal("usd")]),
    value: ExpressionSchema,
  })),
  sources: z.array(SourceSchema),
  filters: z.array(ExpressionSchema),
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const ParserContextSchema = z.object({
  counters: z.record(z.string(), z.number()),
  customers: z.array(CustomerSchema),
});

export type ParserContext = z.infer<typeof ParserContextSchema>;

export const SourceDataSchema = z.array(z.array(z.string()));

export type SourceData = z.infer<typeof SourceDataSchema>;

export interface SourceFile {
  source: string;
  path: string;
  data: SourceData;
}
