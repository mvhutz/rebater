import { CustomerSchema } from "./customers";
import { z } from 'zod';
import { promises as fs } from 'fs';

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
  value: z.string(),
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
]);

const SupplierSchema = z.object({
  name: z.string(),
  properties: z.array(z.object({
    name: z.string(),
    type: z.union([z.literal("string"), z.literal("date"), z.literal("number")]),
    value: ExpressionSchema,
  })),
  sheet: z.string().optional(),
  headers: z.boolean().optional(),
  // path: z.string(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const ParserContextSchema = z.object({
  counters: z.record(z.string(), z.number()),
  customers: z.array(CustomerSchema),
});

export type ParserContext = z.infer<typeof ParserContextSchema>;

const RebateSchema = z.object({
  purchaseId: z.number(),
  transactionDate: z.date(),
  supplierId: z.number(),
  memberId: z.number(),
  distributorName: z.string(),
  purchaseAmount: z.number(),
  rebateAmount: z.number(),
  invoiceId: z.number(),
  invoiceDate: z.date(),
});

type Rebate = z.infer<typeof RebateSchema>;

export async function loadSupplier(path: string) {
  const file = await fs.readFile(path, 'utf-8');
    const json = JSON.parse(file);
    return await SupplierSchema.parseAsync(json);
}

async function evaluateExpression(expression: Expression, row: string[], context: ParserContext, supplier: Supplier): Promise<string> {
  switch(expression.type) {
    case "literal":
      return expression.value;
    case "column":
      return row[expression.index];
    case "counter":
      if (!(expression.name in context.counters)) {
        context.counters[expression.name] = 0;
      }
      return String(context.counters[expression.name]++);
    case "match": {
      const value = await evaluateExpression(expression.value, row, context, supplier);
      const regex = RegExp(expression.regex ?? ".*?");
      const matches = regex.exec(value);
      if (matches == null || matches.length === 1) {
        throw Error(`Could not match expression '${regex}' to '${value}'`);
      }
      return matches[1];
    }
    case "customer": {
      const value = (await evaluateExpression(expression.value, row, context, supplier)).trim().toLowerCase();
      const matches = context.customers.filter(c => c[expression.from].trim().toLowerCase() === value);
      const filtered = [...new Set(matches.map(v => v[expression.to]))];
      if (filtered.length === 0) {
        throw Error(`No matching customer '${value}' for '${supplier.name}' `);
      } else if (filtered.length > 1) {
        throw Error(`Multiple matching customers '${filtered.join("', '")}' for '${supplier.name}' `);
      }

      return String(filtered[0]);
    }
  }
}

export async function parseRow(row: string[], context: ParserContext, supplier: Supplier): Promise<Rebate> {
  const result: Record<string, unknown> = {};

  for (const property of supplier.properties) {
    const evaluated = await evaluateExpression(property.value, row, context, supplier);
    switch (property.type) {
      case "date":
        result[property.name] = new Date(evaluated);
        continue;
      case "number":
        result[property.name] = parseFloat(evaluated.split(',').join(''));
        continue;
      case "string":
        result[property.name] = evaluated;
        continue;
    }
  }

  const parsed = await RebateSchema.parseAsync(result);
  return parsed;
}