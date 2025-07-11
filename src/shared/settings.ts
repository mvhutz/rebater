import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

const ContextSettingsSchema = z.object({
  year: z.int().positive().optional(),
  quarter: z.int().positive().max(4).optional(),
});

/** ------------------------------------------------------------------------- */

const TransformersSchema = z.object({
  tags: z.object({
    include: z.array(z.string()).optional()
  }),
  names: z.object({
    include: z.array(z.string()).optional()
  })
});

/** ------------------------------------------------------------------------- */

const BasicTargetSchema = z.object({
  type: z.literal("basic"),
  directory: z.string().optional(),
});

const AdvancedSettingsSchema = z.object({
  target: z.discriminatedUnion("type", [BasicTargetSchema]),
  doTesting: z.boolean().optional(),
});

export const SettingsSchema = z.object({
  context: ContextSettingsSchema,
  transformers: TransformersSchema,
  advanced: AdvancedSettingsSchema
});

export type Settings = z.infer<typeof SettingsSchema>;

/** ------------------------------------------------------------------------- */

export const DEFAULT_SETTINGS: Settings = {
  context: {},
  transformers: {
    tags: {},
    names: {}
  },
  advanced: {
    target: { type: "basic" },
  }
}