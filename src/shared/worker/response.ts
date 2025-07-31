import { z } from 'zod/v4';

/** ------------------------------------------------------------------------- */

export const QuestionWorkerResponseSchema = z.object({
  type: z.literal("question"),
  question: z.string()
});

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

export type Rebate = z.infer<typeof RebateSchema>;

const TransformerResultSchema = z.object({
  start: z.number(),
  end: z.number(),
  name: z.string()
});

export type TransformerResult = z.infer<typeof TransformerResultSchema>;

const DiscrepencyResultSchema = z.object({
  name: z.string(),
  take: z.array(z.string()),
  drop: z.array(z.string())
});

export type DiscrepencyResult = z.infer<typeof DiscrepencyResultSchema>;

const RunResultsSchema = z.object({
  config: z.array(TransformerResultSchema),
  discrepency: z.array(DiscrepencyResultSchema).optional()
});

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