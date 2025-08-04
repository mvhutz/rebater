import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const AnswerWorkerRequestSchema = z.object({
  type: z.literal("answer"),
  hash: z.string(),
  answer: z.record(z.string(), z.string()).optional(),
});

export type AnswerWorkerRequest = z.infer<typeof AnswerWorkerRequestSchema>;
export type Answer = Omit<AnswerWorkerRequest, "type">;

/** ------------------------------------------------------------------------- */

const ExitWorkerRequestSchema = z.object({
  type: z.literal("exit"),
});

export type ExitWorkerRequest = z.infer<typeof ExitWorkerRequestSchema>;

/** ------------------------------------------------------------------------- */

const IgnoreWorkerRequestSchema = z.object({
  type: z.literal("ignore_all"),
});

export type IgnoreWorkerRequest = z.infer<typeof IgnoreWorkerRequestSchema>;

/** ------------------------------------------------------------------------- */

export const WorkerRequestSchema = z.discriminatedUnion("type", [
  AnswerWorkerRequestSchema,
  ExitWorkerRequestSchema,
  IgnoreWorkerRequestSchema
]);

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;