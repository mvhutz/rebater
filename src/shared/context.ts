import { z } from "zod/v4";
import { Time, TimeSchema } from "./time";

/** ------------------------------------------------------------------------- */

export const ContextSchema = z.object({
  time: TimeSchema,
  transformers: z.object({
    tags: z.object({
      include: z.array(z.string()).default([])
    }),
    names: z.object({
      include: z.array(z.string()).default([])
    })
  }),
});

export type ContextData = z.infer<typeof ContextSchema>;

export class Context {
  data: ContextData;
  time: Time;

  constructor(data: ContextData) {
    this.data = data;
    this.time = new Time(data.time);
  }

  /**
   * Based on the settings, should the program consider running this transformer?
   * @param transformer The transformer to check.
   * @returns If it will run, return true.
   */
  willRun(transformer: { name: string, tags: string[] }): boolean {
    const {
      names: { include: names = [] },
      tags: { include: tags = [] }
    } = this.data.transformers;

    if (names.length > 0 && !names.includes(transformer.name)) {
      return false;
    }

    for (const required_tag of tags) {
      if (!transformer.tags.includes(required_tag)) {
        return false;
      }
    }

    return true;
  }
}