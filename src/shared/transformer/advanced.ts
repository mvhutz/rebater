import { z } from "zod/v4";
import { ExcelIndexSchema } from "../util";

/** ------------------------------------------------------------------------- */

export interface RebateDestinationData {
  type: "rebate"
  name: string;
}

export const RebateDestinationSchema = z.strictObject({
  type: z.literal("rebate"),
  name: z.string(),
});

export interface UtilityDestinationData {
  type: "utility";
  name: string;
}

export const UtilityDestinationSchema = z.strictObject({
  type: z.literal("utility"),
  name: z.string(),
});

export const DestinationSchema: z.ZodType<DestinationData> = z.discriminatedUnion("type", [
  RebateDestinationSchema,
  UtilityDestinationSchema
]);

export type DestinationData = RebateDestinationData | UtilityDestinationData;

/** ------------------------------------------------------------------------- */

export interface ExcelSourceData {
  type: "excel";
  group: string;
  file: string;
  sheets: string[];
}

export const ExcelSourceSchema = z.strictObject({
  type: z.literal("excel"),
  group: z.string(),
  file: z.string().default("*"),
  sheets: z.array(z.string()).default([]),
});

export type SourceData = ExcelSourceData;

export const SourceSchema: z.ZodType<SourceData> = z.discriminatedUnion("type", [
  ExcelSourceSchema
]);

/** ------------------------------------------------------------------------- */

export interface ChopTableData {
  type: "chop",
  column: number,
  is: string[]
  keep: "top" | "bottom";
  otherwise: "drop" | "take";
}

export const ChopTableSchema = z.strictObject({
  type: z.literal("chop"),
  column: ExcelIndexSchema,
  is: z.array(z.string()),
  keep: z.union([z.literal("top"), z.literal("bottom")]).default("bottom"),
  otherwise: z.union([z.literal("drop"), z.literal("take")]).default("drop")
});

export interface CoalesceTableData {
  type: "coalesce";
  match: number[];
  combine: number[];
}

export const CoalesceTableSchema = z.strictObject({
  type: z.literal("coalesce"),
  match: z.array(ExcelIndexSchema),
  combine: z.array(ExcelIndexSchema).default([])
});

export interface DebugTableData {
  type: "debug";
  name: string;
}

export const DebugTableSchema = z.strictObject({
  type: z.literal("debug"),
  name: z.string().default("default"),
});

export interface FilterTableData {
  type: "filter";
  criteria: RowData[];
}

export const FilterTableSchema = z.strictObject({
  type: z.literal("filter"),
  criteria: z.lazy(() => z.array(RowSchema)),
});

export interface HeaderTableData {
  type: "header";
  names: string[];
  action: "drop" | "keep";
}

export const HeaderTableSchema = z.strictObject({
  type: z.literal("header"),
  names: z.array(z.string()),
  action: z.union([z.literal("drop"), z.literal("keep")]),
});

export interface PercolateTableData {
  type: "percolate";
  columns: number[];
  matches: string[];
}

export const PercolateTableSchema = z.strictObject({
  type: z.literal("percolate"),
  columns: z.array(ExcelIndexSchema),
  matches: z.array(z.string()).default([""])
});

export interface SelectTableData {
  type: "select";
  column: number;
  is: string;
  action: "drop" | "keep";
}

export const SelectTableSchema = z.strictObject({
  type: z.literal("select"),
  column: ExcelIndexSchema,
  is: z.string(),
  action: z.union([z.literal("drop"), z.literal("keep")]).default("keep"),
});

export interface SetTableData {
  type: "set";
  column: number;
  to: RowData[];
}

export const SetTableSchema = z.strictObject({
  type: z.literal("set"),
  column: ExcelIndexSchema,
  to: z.lazy(() => z.array(RowSchema)),
});

export interface TrimTableData {
  type: "trim";
  top?: number;
  bottom?: number;
}

export const TrimTableSchema = z.strictObject({
  type: z.literal("trim"),
  top: z.number().optional(),
  bottom: z.number().optional(),
});

export type TableData =
  | ChopTableData
  | CoalesceTableData
  | DebugTableData
  | FilterTableData
  | HeaderTableData
  | PercolateTableData
  | SelectTableData
  | SetTableData
  | TrimTableData;

export const TableSchema: z.ZodType<TableData> = z.discriminatedUnion("type", [
  ChopTableSchema,
  CoalesceTableSchema,
  DebugTableSchema,
  FilterTableSchema,
  HeaderTableSchema,
  PercolateTableSchema,
  SelectTableSchema,
  SetTableSchema,
  TrimTableSchema,
]);

/** ------------------------------------------------------------------------- */

export interface AbsoluteRowData {
  type: "abs"
}

export const AbsoluteRowSchema = z.strictObject({
  type: z.literal("abs"),
});

export interface AddRowData {
  type: "add";
  with: RowData[];
}

export const AddRowSchema = z.strictObject({
  type: z.literal("add"),
  with: z.lazy(() => z.array(RowSchema))
});

export interface CharacterRowData {
  type: "character";
  select: string;
  action: "keep" | "drop";
}

export const CharacterRowSchema = z.strictObject({
  type: z.literal("character"),
  select: z.string(),
  action: z.union([z.literal("keep"), z.literal("drop")]).default("keep")
});

export interface CoerceDateRowData {
  type: "coerce";
  as: "date";
  year: "assume" | "keep",
  parse: string[];
  format: string;
}

export const CoerceDateRowSchema = z.strictObject({
  type: z.literal("coerce"),
  as: z.literal("date"),
  year: z.union([z.literal("assume"), z.literal("keep")]).default("keep"),
  parse: z.array(z.string()).default([]),
  format: z.string().default("M/D/YYYY"),
});

export interface CoerceNumberRowData {
  type: "coerce";
  as: "number";
  otherwise?: string;
}

export const CoerceNumberRowSchema = z.strictObject({
  type: z.literal("coerce"),
  as: z.literal("number"),
  otherwise: z.string().optional(),
});

export interface CoerceUSDRowData {
  type: "coerce";
  as: "usd";
  round: "up" | "down" | "default"
}

export const CoerceUSDRowSchema = z.strictObject({
  type: z.literal("coerce"),
  as: z.literal("usd"),
  round: z.union([z.literal("up"), z.literal("down"), z.literal("default")]).default("default"),
});

export const CoerceRowSchema = z.discriminatedUnion("as", [
  CoerceDateRowSchema,
  CoerceNumberRowSchema,
  CoerceUSDRowSchema
]);

export interface ColumnRowData {
  type: "column";
  index: number;
}

export const ColumnRowSchema = z.strictObject({
  type: z.literal("column"),
  index: ExcelIndexSchema
});

export interface ConcatRowData {
  type: "concat";
  with: RowData[];
  separator: string;
}

export const ConcatRowSchema = z.strictObject({
  type: z.literal("concat"),
  with: z.lazy(() => z.array(RowSchema)),
  separator: z.string().default("")
});

export interface CounterRowData {
  type: "counter"
}

export const CounterRowSchema = z.strictObject({
  type: z.literal("counter"),
});

export interface DivideRowData {
  type: "divide";
  with: RowData[];
}

export const DivideRowSchema = z.strictObject({
  type: z.literal("divide"),
  with: z.lazy(() => z.array(RowSchema)),
});

export interface EqualsRowData {
  type: "equals";
  with: RowData[];
}

export const EqualsRowSchema = z.strictObject({
  type: z.literal("equals"),
  with: z.lazy(() => z.array(RowSchema)),
});

export interface LiteralRowData {
  type: "literal";
  value: string;
}

export const LiteralRowSchema = z.strictObject({
  type: z.literal("literal"),
  value: z.coerce.string(),
});

export const MetaTypeSchema = z.enum([
  "quarter.lastday",
  "quarter.number",
  "row.source",
]);

export type MetaType = z.infer<typeof MetaTypeSchema>;

export interface MetaRowData {
  type: "meta",
  value: MetaType;
}

export const MetaRowSchema = z.strictObject({
  type: z.literal("meta"),
  value: MetaTypeSchema
});

export interface MultiplyRowData {
  type: "multiply",
  with: RowData[];
}

export const MultiplyRowSchema = z.strictObject({
  type: z.literal("multiply"),
  with: z.lazy(() => z.array(RowSchema)),
});

export interface ReferenceRowData {
  type: "reference";
  table: string;
  match: string;
  take: string;
  group: string;
}

export const ReferenceRowSchema = z.strictObject({
  type: z.literal("reference"),
  table: z.string(),
  match: z.string(),
  take: z.string(),
  group: z.string(),
});

export interface ReplaceRowData {
  type: "replace";
  characters?: string;
  substring?: string;
  all?: string;
  put: string,
  put_meta?: MetaRowData["value"],
}

export const ReplaceRowSchema = z.strictObject({
  type: z.literal("replace"),
  characters: z.string().min(1).optional(),
  substring: z.string().min(1).optional(),
  all: z.string().optional(),
  put: z.string().default(""),
  put_meta: MetaTypeSchema.optional(),
});

export interface SearchRowData {
  type: "search";
  table: string;
  matches?: Record<string, {
    optional?: boolean;
    primary?: boolean;
    definition: RowData[];
  }>;
  take: string;
}

export const SearchRowSchema = z.strictObject({
  type: z.literal("search"),
  table: z.string(),
  matches: z.record(z.string(), z.strictObject({
    optional: z.boolean().default(false),
    primary: z.boolean().default(false),
    definition: z.array(z.lazy(() => RowSchema))
  })).default({}),
  take: z.string(),
});

export interface SignumRowData {
  type: "sign";
}

export const SignumRowSchema = z.strictObject({
  type: z.literal("sign"),
});

export interface SubtractRowData {
  type: "subtract";
  with: RowData[];
}

export const SubtractRowSchema = z.strictObject({
  type: z.literal("subtract"),
  with: z.lazy(() => z.array(RowSchema))
});

export interface SumRowData {
  type: "sum";
  column: number;
}

export const SumRowSchema = z.strictObject({
  type: z.literal("sum"),
  column: ExcelIndexSchema,
});

export interface TrimRowData {
  type: "trim";
}

export const TrimRowSchema = z.strictObject({
  type: z.literal("trim"),
});

export interface UtilityRowData {
  type: "utility";
  table: string;
  match: string;
  take: string;
  group: string;
}

export const UtilityRowSchema = z.strictObject({
  type: z.literal("utility"),
  table: z.string(),
  match: z.string(),
  take: z.string(),
  group: z.string(),
});

export type RowData =
  | AbsoluteRowData
  | AddRowData
  | CharacterRowData
  | CoerceDateRowData
  | CoerceNumberRowData
  | CoerceUSDRowData
  | ColumnRowData
  | ConcatRowData
  | CounterRowData
  | DivideRowData
  | EqualsRowData
  | LiteralRowData
  | MetaRowData
  | MultiplyRowData
  | ReferenceRowData
  | ReplaceRowData
  | SearchRowData
  | SignumRowData
  | SubtractRowData
  | SumRowData
  | TrimRowData
  | UtilityRowData;

export const RowSchema: z.ZodType<RowData> = z.discriminatedUnion("type", [
  AbsoluteRowSchema,
  AddRowSchema,
  CharacterRowSchema,
  CoerceRowSchema,
  ColumnRowSchema,
  ConcatRowSchema,
  CounterRowSchema,
  DivideRowSchema,
  EqualsRowSchema,
  LiteralRowSchema,
  MetaRowSchema,
  MultiplyRowSchema,
  ReferenceRowSchema,
  ReplaceRowSchema,
  SearchRowSchema,
  SignumRowSchema,
  SubtractRowSchema,
  SumRowSchema,
  TrimRowSchema,
  UtilityRowSchema
]);

/** ------------------------------------------------------------------------- */

export interface AdvancedTransformerData {
  type: "advanced";
  name: string;
  tags: string[];
  sources: SourceData[];
  requirements: string[];
  preprocess: TableData[];
  properties: {
    name: string,
    definition: RowData[];
  }[],
  postprocess: TableData[];
  destination: DestinationData[];
}

export const AdvancedTransformerSchema: z.ZodObject & z.ZodType<AdvancedTransformerData> = z.strictObject({
  type: z.literal("advanced"),
  name: z.string(),
  tags: z.array(z.string()),
  sources: z.array(SourceSchema),
  requirements: z.array(z.string()),
  preprocess: z.array(TableSchema),
  properties: z.array(z.strictObject({
    name: z.string(),
    definition: z.array(RowSchema)
  })),
  postprocess: z.array(TableSchema),
  destination: z.array(DestinationSchema),
});