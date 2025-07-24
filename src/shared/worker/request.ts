import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const AnswerWorkerRequestSchema = z.object({
  type: z.literal("answer"),
  question: z.string(),
  answer: z.string().optional(),
});

export type AnswerWorkerRequest = z.infer<typeof AnswerWorkerRequestSchema>;

export const WorkerRequestSchema = z.discriminatedUnion("type", [
  AnswerWorkerRequestSchema
]);

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;