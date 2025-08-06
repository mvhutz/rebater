import { z } from 'zod/v4';

/** ------------------------------------------------------------------------- */

/**
 * Used to ask the main thread a question.
 */
export const QuestionWorkerResponseSchema = z.object({
  type: z.literal("question"),
  table: z.string(),
  hash: z.string(),
  unknown: z.string(),
  known: z.record(z.string(), z.string()),
  optional: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([])
});

export type Question = Omit<z.infer<typeof QuestionWorkerResponseSchema>, "type">;

/** ------------------------------------------------------------------------- */

export const RebateSchema = z.strictObject({
  purchaseId: z.coerce.string(),
  transactionDate: z.coerce.string(),
  supplierId: z.coerce.string(),
  memberId: z.coerce.string(),
  distributorName: z.coerce.string(),
  purchaseAmount: z.coerce.number(),
  rebateAmount: z.coerce.number(),
  invoiceId: z.coerce.string(),
  invoiceDate: z.coerce.string(),
});

/**
 * A rebate object.
 */
export type Rebate = z.infer<typeof RebateSchema>;


const TransformerResultSchema = z.object({
  start: z.number(),
  end: z.number(),
  name: z.string()
});

/**
 * The statistics of a transformer, when run.
 * @property {} start The time when the transformer started.
 * @property {} end The time when the transformer finished.
 * @property {} name The identifier of the transformers.
 */
export type TransformerResult = z.infer<typeof TransformerResultSchema>;


const DiscrepencyResultSchema = z.object({
  name: z.string(),
  match: z.number(),
  take: z.array(z.string()),
  drop: z.array(z.string())
});

/**
 * The differences between the expected (truth) results for a supplier, and the actual (rebates) results.
 * @property {} name The identifier of the supplier.
 * @property {} match The number of records that match.
 * @property {} take All rows in the expected results, which do not appear on the actual results.
 * @property {} drop All rows in the actual results, which do not appear on the expected results.
 */
export type DiscrepencyResult = z.infer<typeof DiscrepencyResultSchema>;

const RunResultsSchema = z.object({
  config: z.array(TransformerResultSchema),
  discrepency: z.array(DiscrepencyResultSchema).optional()
});

/**
 * The results of running the program.
 */
export type RunResults = z.infer<typeof RunResultsSchema>;

/** ------------------------------------------------------------------------- */

const IdleSystemStatusSchema = z.object({
  type: z.literal("idle")
});

const DoneSystemStatusSchema = z.object({
  type: z.literal("done"),
  results: RunResultsSchema
});

const ErrorSystemStatusSchema = z.object({
  type: z.literal("error"),
  message: z.string().optional()
});

const LoadingSystemStatusSchema = z.object({
  type: z.literal("loading"),
  message: z.string().optional(),
});

const RunningSystemStatusSchema = z.object({
  type: z.literal("running"),
  progress: z.number()
});

export const SystemStatusSchema = z.discriminatedUnion("type", [
  IdleSystemStatusSchema,
  DoneSystemStatusSchema,
  ErrorSystemStatusSchema,
  LoadingSystemStatusSchema,
  RunningSystemStatusSchema
]);

/**
 * What the system is up to.
 */
export type SystemStatus = z.infer<typeof SystemStatusSchema>;

export const StatusWorkerResponseSchema = z.object({
  type: z.literal("status"),
  status: SystemStatusSchema,
});

/** ------------------------------------------------------------------------- */

export const WorkerResponseSchema = z.discriminatedUnion("type", [
  StatusWorkerResponseSchema,
  QuestionWorkerResponseSchema
])

export type WorkerResponse = z.infer<typeof WorkerResponseSchema>;