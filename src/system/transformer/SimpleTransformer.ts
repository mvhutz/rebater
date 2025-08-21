import z from "zod/v4";
import { Runner } from "../runner/Runner";
import { TABLE_SCHEMA } from "../table";
import { AdvancedTransformer } from "./AdvancedTransformer";
import { ExcelSource } from "../source/Excel";
import { CounterRow } from "../row/Counter";
import { ColumnRow } from "../row/Column";
import { CoerceNumberRow } from "../row/CoerceNumber";
import { CoerceDateRow } from "../row/CoerceDate";
import { LiteralRow } from "../row/Literal";
import { ReferenceRow } from "../row/Reference";
import { CoerceUSDRow } from "../row/CoerceUSD";
import { MultiplyRow } from "../row/Multiply";
import { CharacterRow } from "../row/Character";
import { RebateDestination } from "../destination/Rebate";
import { TransformerResult } from "../../shared/worker/response";
import { SelectTable } from "../table/Select";
import { SetTable } from "../table/Set";
import { MetaRow } from "../row/Meta";
import { SumRow } from "../row/Sum";
import { DivideRow } from "../row/Divide";
import { BaseTransformer } from "./BaseTransformers";

/** ------------------------------------------------------------------------- */

export interface SimpleTransformerData {
  type: "simple";
  name: string;
  group: string;
  source: {
    sheets: string[];
    file?: string;
  }
  properties: {
    purchaseId: "counter";
    transactionDate?: { column: number; parse?: string; };
    supplierId?: { value: string; }
    memberId?: { column: number; }
    distributorName?:
      | { type: "value", value: string; }
      | { type: "column", column: number; }
    purchaseAmount?: { column: number; };
    rebateAmount?: { column: number; multiplier?: number; };
    invoiceId?: { column: number; };
    invoiceDate?: { column: number; parse?: string; };
  }
  options: {
    canadian_rebate: boolean,
    remove_null_rebates: boolean;
    additional_preprocessing?: string;
    additional_postprocessing?: string;
  }
}

/** ------------------------------------------------------------------------- */

export class SimpleTransformer implements BaseTransformer {
  private readonly data: SimpleTransformerData;
  public constructor(data: SimpleTransformerData) {
    this.data = data;
  }

  getDetails(): { name: string, tags: string[] } {
    return { name: this.data.name, tags: [this.data.group] };
  }

  // Will throw.
  public buildTransformer(): AdvancedTransformer {
    const {
      transactionDate,
      supplierId,
      memberId,
      distributorName,
      purchaseAmount,
      rebateAmount,
      invoiceId,
      invoiceDate,
    } = this.data.properties;

    const source = new ExcelSource(this.data.group, this.data.source.file ?? "*", this.data.source.sheets);

    /** --------------------------------------------------------------------- */

    const preprocessing = [];
    if (this.data.options.additional_preprocessing != null) {
      const json = JSON.parse(this.data.options.additional_preprocessing);
      const parsed = z.array(TABLE_SCHEMA).parse(json);
      preprocessing.push(...parsed);
    }

    const FILE_TOTAL_COLUMN = 50;
    const REBATE_TOTAL_COLUMN = 51;

    if (this.data.options.canadian_rebate != null && rebateAmount) {
      preprocessing.push(...[
        new SetTable(FILE_TOTAL_COLUMN, [
          new MetaRow("row.source"),
          new ReferenceRow("deposit", "file", "amount", this.data.group)
        ]),
        new SetTable(REBATE_TOTAL_COLUMN, [
          new SumRow(rebateAmount.column),
        ])
      ]);
    }

    /** --------------------------------------------------------------------- */

    const properties: AdvancedTransformer["properties"] = [];


    properties.push({ name: "purchaseId", definition: [
      new CounterRow()
    ] });

    if (transactionDate) {
      properties.push({ name: "transactionDate", definition: [
        new ColumnRow(transactionDate.column),
        new CoerceDateRow({
          type: "coerce",
          as: "date",
          parse: transactionDate.parse ? [transactionDate.parse] : undefined
        })
      ] });
    }

    if (supplierId) {
      properties.push({ name: "supplierId", definition: [
        new LiteralRow(supplierId.value)
      ] });
    }

    if (memberId) {
      properties.push({ name: "memberId", definition: [
        new ColumnRow(memberId.column),
        new ReferenceRow("customers", "customerName", "fuseId", this.data.group),
      ] });
    }

    if (distributorName) {
      properties.push({ name: "distributorName", definition: [
        distributorName.type === "column"
          ? new ColumnRow(distributorName.column)
          : new LiteralRow(distributorName.value),
        new ReferenceRow("customers", "customerName", "fuseId", this.data.group),
      ] });
    }

    if (purchaseAmount) {
      properties.push({ name: "purchaseAmount", definition: [
        new ColumnRow(purchaseAmount.column),
        new CoerceUSDRow("default"),
      ] });
    }

    if (rebateAmount) {
      if (this.data.options.canadian_rebate != null) {
        properties.push({ name: "rebateAmount", definition: [
          new ColumnRow(rebateAmount.column),
          new MultiplyRow([
            new ColumnRow(FILE_TOTAL_COLUMN)
          ]),
          new DivideRow([
            new ColumnRow(REBATE_TOTAL_COLUMN)
          ]),
          new MultiplyRow([
            new LiteralRow((rebateAmount.multiplier ?? 1).toString())
          ]),
          new CoerceUSDRow("default"),
        ] });
      } else {
        properties.push({ name: "rebateAmount", definition: [
          new ColumnRow(rebateAmount.column),
          new MultiplyRow([
            new LiteralRow((rebateAmount.multiplier ?? 1).toString())
          ]),
          new CoerceUSDRow("default"),
        ] });
      }
    }

    if (invoiceId) {
      properties.push({ name: "invoiceId", definition: [
        new ColumnRow(invoiceId.column),
        new CharacterRow(".1234567890", "keep"),
        new CoerceNumberRow("99999"),
      ] });
    }

    if (invoiceDate) {
      properties.push({ name: "invoiceDate", definition: [
        new ColumnRow(invoiceDate.column),
        new CoerceDateRow({
          type: "coerce",
          as: "date",
          parse: invoiceDate.parse ? [invoiceDate.parse] : undefined
        })
      ] });
    }

    /** --------------------------------------------------------------------- */

    const postprocessing = [];
    if (this.data.options.additional_postprocessing != null) {
      const json = JSON.parse(this.data.options.additional_postprocessing);
      const parsed = z.array(TABLE_SCHEMA).parse(json);
      postprocessing.push(...parsed);
    }

    if (this.data.options.remove_null_rebates) {
      postprocessing.push(new SelectTable(6, "drop", "0.00"));
    }

    /** ------------------------------------------------------------------------- */

    const destination = new RebateDestination(this.data.name);

    return new AdvancedTransformer(
      this.data.name,
      [this.data.group],
      [source],
      preprocessing,
      properties,
      postprocessing,
      [destination],
      []
    );
  }

  /**
     * Run the transformer.
     * @param runner The context to run in.
     * @returns Information as to how well the transformer ran.
     */
  public run(runner: Runner): TransformerResult {
    const transformer = this.buildTransformer();
    return transformer.run(runner);
  };

  toJSON(): SimpleTransformerData {
    return this.data;
  }

  public static fromJSON(data: SimpleTransformerData): SimpleTransformer {
    return new SimpleTransformer(data);
  }

  public static readonly SCHEMA: z.ZodType<SimpleTransformer, SimpleTransformerData> = z.strictObject({
    type: z.literal("simple"),
    name: z.string(),
    group: z.string(),
    source: z.strictObject({
      sheets: z.array(z.string()),
      file: z.string().optional(),
    }),
    properties: z.strictObject({
      purchaseId: z.literal("counter"),
      transactionDate: z.strictObject({ column: z.number(), parse: z.string().optional() }).optional(),
      supplierId: z.strictObject({ value: z.string() }).optional(),
      memberId: z.strictObject({ column: z.number() }).optional(),
      distributorName: z.discriminatedUnion("type", [
        z.strictObject({ type: z.literal("value"), value: z.string() }),
        z.strictObject({ type: z.literal("column"), column: z.number() }),
      ]).optional(),
      purchaseAmount: z.strictObject({ column: z.number() }).optional(),
      rebateAmount: z.strictObject({ column: z.number(), multiplier: z.number().optional() }).optional(),
      invoiceId: z.strictObject({ column: z.number() }).optional(),
      invoiceDate: z.strictObject({ column: z.number(), parse: z.string().optional() }).optional(),
    }),
    options: z.strictObject({
      canadian_rebate: z.boolean(),
      remove_null_rebates: z.boolean(),
      additional_preprocessing: z.string().optional(),
      additional_postprocessing: z.string().optional(),
    }),
  }).transform(d => new SimpleTransformer(d))
}
