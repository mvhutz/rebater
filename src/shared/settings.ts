import path from "path";
import z from "zod/v4";
import { Time, TimeSchema } from "./time";

/** ------------------------------------------------------------------------- */

export const SettingsSchema = z.object({
  time: TimeSchema,
  transformers: z.object({
    tags: z.object({
      include: z.array(z.string()).default([])
    }),
    names: z.object({
      include: z.array(z.string()).default([])
    })
  }),
  directory: z.string(),
  testing: z.strictObject({
    enabled: z.boolean().default(false),
    compare_all: z.boolean().default(false),
  })
});

/** A settings object, as JSON. */
export type SettingsData = z.infer<typeof SettingsSchema>;

/** ------------------------------------------------------------------------- */

/**
 * Stores various details about the programs configuration.
 */
export class Settings {
  public readonly data: SettingsData;
  public readonly time: Time;

  public constructor(data: SettingsData) {
    this.data = data
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

  /**
   * Get the directory for all sources for a certain quarter.
   * @param t The quarter to search for. Defaults to the current quarter.
   * @returns The location of the directory.
   */
  getSourcePath(t = this.time) {
    return path.join(this.data.directory, "sources", t.toString());
  }

  /**
   * Get the top-level `source` directory.
   */
  getAllSourcePath() {
    return path.join(this.data.directory, "sources");
  }

  /**
   * Get the expected location of a specific output file, for the current quarter.
   * @param extension The extension of the output file.
   */
  getOutputFile(extension: string) {
    return path.join(this.data.directory, "upload", this.time.toString(), `TOTAL.${extension}`);
  }
}
