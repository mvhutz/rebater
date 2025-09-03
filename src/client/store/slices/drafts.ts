import { z } from "zod/v4";
import { TransformerMeta } from "../../../shared/state/stores/TransformerStore";
import { TimeData } from "../../../shared/time";
import { SimpleTransformerData } from "../../../shared/transformer/simple";
import { DefaultString, EmptyString, Excel2Number, String2JSON, String2Number } from "../../../shared/util";
import { AdvancedTransformerSchema, TableSchema } from "../../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

export interface SettingsDraft {
  directory?: string;
  testing: { enabled: boolean; compare_all: boolean; };
}

export interface ContextDraft {
  time?: TimeData;
  transformers: {
    tags: { include: string[]; };
    names: { include: string[]; };
  };
}

/** ------------------------------------------------------------------------- */

export const AdvancedDraft2Transformer = z.codec(
  z.strictObject({
    type: z.literal("advanced"),
    text: z.string()
  }),
  AdvancedTransformerSchema,
  {
    decode: (v, ctx) => {
      try {
        return String2JSON.pipe(AdvancedTransformerSchema).decode(v.text);
      } catch (err: unknown) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: v.text,
          message: String(err),
        });
        return z.NEVER;
      }
    },
    encode: v => ({ type: "advanced" as const, text: JSON.stringify(v, null, 2) })
  }
)

export type AdvancedTransformerDraft = z.input<typeof AdvancedDraft2Transformer>;

/** ------------------------------------------------------------------------- */

export const SimpleDraft2Transformer = z.strictObject({
  type: z.literal("simple"),
  name: z.string(),
  group: z.string(),
  source: z.strictObject({
    sheets: z.array(z.string()),
    file: z.string(),
    trim: z.strictObject({
      top: DefaultString("0").pipe(String2Number).pipe(z.int().nonnegative()),
      bottom: DefaultString("0").pipe(String2Number).pipe(z.int().nonnegative()),
    })
  }),
  properties: z.strictObject({
    purchaseId: z.literal("counter"),
    transactionDate: z.strictObject({
      column: Excel2Number,
      parse: EmptyString
    }),
    supplierId: z.strictObject({
      value: z.string()
    }),
    memberId: z.strictObject({
      column: Excel2Number
    }),
    distributorName: z.discriminatedUnion("type", [
      z.strictObject({
        type: z.literal("name"),
        value: z.string()
      }),
      z.strictObject({
        type: z.literal("column"),
        value: Excel2Number
      }),
    ]),
    purchaseAmount: z.strictObject({
      column: Excel2Number
    }),
    rebateAmount: z.strictObject({
      column: Excel2Number,
      multiplier: DefaultString("1").pipe(String2Number)
    }),
    invoiceId: z.strictObject({
      column: Excel2Number
    }),
    invoiceDate: z.strictObject({
      column: Excel2Number,
      parse: EmptyString
    }),
  }),
  options: z.strictObject({
    canadian_rebate: z.boolean(),
    remove_null_rebates: z.boolean(),
    additional_preprocessing: DefaultString("[]").pipe(String2JSON).pipe(z.array(TableSchema)),
    additional_postprocessing: DefaultString("[]").pipe(String2JSON).pipe(z.array(TableSchema)),
  }),
}) satisfies z.ZodType<SimpleTransformerData>;

export type SimpleTransformerDraft = z.input<typeof SimpleDraft2Transformer>;

/** ------------------------------------------------------------------------- */

export const Draft2Transformer = z.discriminatedUnion("type", [
  SimpleDraft2Transformer,
  AdvancedDraft2Transformer
]);

export type TransformerDraft = z.input<typeof Draft2Transformer>;

export interface CreateTransformerPageInfo {
  type: "create";
  draft: TransformerDraft;
}

export interface UpdateTransformerPageInfo {
  type: "update";
  meta: TransformerMeta;
  draft: TransformerDraft;
}

export interface EmptyTransformerPageInfo {
  type: "empty";
}

export type TransformerPageInfo =
  | CreateTransformerPageInfo
  | UpdateTransformerPageInfo
  | EmptyTransformerPageInfo;