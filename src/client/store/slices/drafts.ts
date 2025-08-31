import { TransformerMeta } from "../../../shared/state/stores/TransformerStore";
import { TimeData } from "../../../shared/time";
import { SimpleTransformerData } from "../../../shared/transformer/simple";

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

export type SimpleTransformerDraft = SimpleTransformerData;

export type TransformerDraft = SimpleTransformerData | AdvancedTransformerDraft;

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