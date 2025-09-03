import { AdvancedTransformer } from "./AdvancedTransformer";
import { Transformer } from "./Transformer";
import { AdvancedTransformerData, DestinationData, SourceData, TableData } from "../../shared/transformer/advanced";
import { SimpleTransformerData } from "../../shared/transformer/simple";
import { State } from "../../shared/state";
import { Context } from "../../shared/context";
import { StatsData } from "../../shared/stats";

/** ------------------------------------------------------------------------- */

export class SimpleTransformer implements Transformer {
  private readonly data: SimpleTransformerData;
  public constructor(data: SimpleTransformerData) {
    this.data = data;
    this.name = this.data.name;
  }
  public name: string;

  public getDeps(): string[] {
    return [];
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

    const source: SourceData = {
      type: "excel",
      group: this.data.group,
      file: this.data.source.file,
      sheets: this.data.source.sheets
    }

    /** --------------------------------------------------------------------- */

    const preprocessing: TableData[] = [];

    const FILE_TOTAL_COLUMN = 50;
    const REBATE_TOTAL_COLUMN = 51;

    if (this.data.options.canadian_rebate) {
      preprocessing.push(
        { type: "set", column: FILE_TOTAL_COLUMN, to: [
          { type: "meta", value: "row.source" },
          { type: "reference", table: "deposit", match: "file", take: "amount", group: this.data.group }
        ] },
        { type: "set", column: REBATE_TOTAL_COLUMN, to: [
          { type: "sum", column: rebateAmount.column }
        ] }
      );
    }

    preprocessing.push({ type: "trim", ...this.data.source.trim });
    preprocessing.push(...this.data.options.additional_preprocessing);

    /** --------------------------------------------------------------------- */

    const properties: AdvancedTransformerData["properties"] = [];

    properties.push({ name: "purchaseId", definition: [
      { type: "counter" }
    ] });

    properties.push({ name: "transactionDate", definition: [
      { type: "column", index: transactionDate.column },
      { type: "coerce",
        as: "date",
        parse: transactionDate.parse != null ? [transactionDate.parse] : [],
        year: "keep",
        format: "M/D/YYYY" }
    ] });

    properties.push({ name: "supplierId", definition: [
      { type: "literal", value: supplierId.value }
    ] });

    properties.push({ name: "memberId", definition: [
      { type: "column", index: memberId.column },
      { type: "reference", table: "customers", match: "customerName", take: "fuseId", group: this.data.group },
    ] });

    if (distributorName.type === "column") {
      properties.push({ name: "distributorName", definition: [
        { type: "column", index: distributorName.value },
        { type: "reference", table: "distributors", match: "fuzzyName", take: "trueName", group: this.data.group },
      ] });
    } else {
      properties.push({ name: "distributorName", definition: [
        { type: "literal", value: distributorName.value },
      ] });
    }

    properties.push({ name: "purchaseAmount", definition: [
      { type: "column", index: purchaseAmount.column },
      { type: "coerce", as: "usd", round: "default" }
    ] });

    if (this.data.options.canadian_rebate) {
      properties.push({ name: "rebateAmount", definition: [
        { type: "column", index: rebateAmount.column },
        { type: "multiply", with: [
          { type: "column", index: FILE_TOTAL_COLUMN }
        ] },
        { type: "divide", with: [
          { type: "column", index: REBATE_TOTAL_COLUMN }
        ] },
        { type: "multiply", with: [
          { type: "literal", value: rebateAmount.multiplier.toString() }
        ] },
        { type: "coerce", as: "usd", round: "default" }
      ] });
    } else {
      properties.push({ name: "rebateAmount", definition: [
        { type: "column", index: rebateAmount.column },
        { type: "multiply", with: [
          { type: "literal", value: rebateAmount.multiplier.toString() }
        ] },
        { type: "coerce", as: "usd", round: "default" }
      ] });
    }

    properties.push({ name: "invoiceId", definition: [
      { type: "column", index: invoiceId.column },
      { type: "character", select: "1234567890", action: "keep" },
      { type: "coerce", as: "number", otherwise: "99999" }
    ] });

    properties.push({ name: "invoiceDate", definition: [
      { type: "column", index: invoiceDate.column },
      { type: "coerce",
        as: "date",
        parse: transactionDate.parse != null ? [transactionDate.parse] : [],
        year: "keep",
        format: "M/D/YYYY" }
    ] });

    /** --------------------------------------------------------------------- */

    const postprocessing: TableData[] = [];
    postprocessing.push(...this.data.options.additional_postprocessing);

    if (this.data.options.remove_null_rebates) {
      postprocessing.push({ type: "select", column: 6, is: "0.00", action: "drop" });
    }

    /** ------------------------------------------------------------------------- */

    const destination: DestinationData = { type: "rebate", name: this.data.name };

    return new AdvancedTransformer({
      type: "advanced",
      name: this.data.name,
      tags: [this.data.group],
      sources: [source],
      preprocess: preprocessing,
      properties,
      postprocess: postprocessing,
      destination: [destination],
      requirements: []
    });
  }

  /**
     * Run the transformer.
     * @param runner The context to run in.
     * @returns Information as to how well the transformer ran.
     */
  public run(state: State, context: Context, stats: StatsData) {
    const transformer = this.buildTransformer();
    transformer.run(state, context, stats);
  };
}
