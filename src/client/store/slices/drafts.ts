import { TransformerMeta } from "../../../shared/state/stores/TransformerStore";
import { TimeData } from "../../../shared/time";

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

export interface AdvancedTransformerDraft {
  type: "advanced";
  text: string;
}

/** ------------------------------------------------------------------------- */

export interface SimpleTransformerDraft {
  type: "simple";
  name: string;
  group: string;
  source: {
    sheets: string[];
    file?: string;
    trim: {
      top?: string;
      bottom?: string;
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

/** ------------------------------------------------------------------------- */

export type TransformerDraft = SimpleTransformerDraft | AdvancedTransformerDraft;

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