import z from "zod/v4";
import { SettingsSchema } from "./settings";

/** ------------------------------------------------------------------------- */

const StartWorkerRequestSchema = z.object({
  type: z.literal("start"),
  settings: SettingsSchema,
});

export type StartWorkerRequest = z.infer<typeof StartWorkerRequestSchema>;

const AnswerWorkerRequestSchema = z.object({
  type: z.literal("answer"),
  answer: z.string().optional(),
});

export type AnswerWorkerRequest = z.infer<typeof AnswerWorkerRequestSchema>;

export const WorkerRequestSchema = z.discriminatedUnion("type", [
  StartWorkerRequestSchema,
  AnswerWorkerRequestSchema
]);

export type WorkerRequest = z.infer<typeof WorkerRequestSchema>;
