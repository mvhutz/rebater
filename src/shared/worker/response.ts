import { z } from 'zod/v4';
import { StatsSchema } from '../stats';

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

export const QuestionSchema = z.object({
  table: z.string(),
  hash: z.string(),
  unknown: z.string(),
  known: z.record(z.string(), z.string()),
  optional: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([])
});

export type Question = z.infer<typeof QuestionSchema>;

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

/** ------------------------------------------------------------------------- */

const IdleSystemStatusSchema = z.object({
  type: z.literal("idle")
});

const DoneSystemStatusSchema = z.object({
  type: z.literal("done"),
  results: StatsSchema
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