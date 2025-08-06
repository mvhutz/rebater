import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const AnswerWorkerRequestSchema = z.object({
  type: z.literal("answer"),
  hash: z.string(),
  answer: z.record(z.string(), z.string()).optional(),
});

/**
 * This request is used to answer a question the worker has.
 */
export type AnswerWorkerRequest = z.infer<typeof AnswerWorkerRequestSchema>;

/**
 * An answer to a worker question.
 * @property {} hash The ID of the question.
 * @property {} answer A completed object, which contains the details known from the question, and the unknown property posed by the question.
 */
export type Answer = Omit<AnswerWorkerRequest, "type">;

/** ------------------------------------------------------------------------- */

/**
 * Used to tell the worker to gracefully shut down.
 */
const ExitWorkerRequestSchema = z.object({
  type: z.literal("exit"),
});

export type ExitWorkerRequest = z.infer<typeof ExitWorkerRequestSchema>;

/** ------------------------------------------------------------------------- */

/**
 * Used to tell the worker to ignore all future questions.
 */
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

/**
 * A message sent to the worker.
 */
export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;