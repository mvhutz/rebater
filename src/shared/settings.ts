import path from "path";
import z from "zod/v4";
import { Time } from "./time";

/** ------------------------------------------------------------------------- */

export const SettingsSchema = z.object({
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

  public constructor(data: SettingsData) {
    this.data = data;
  }

  /**
   * Get the directory for all sources for a certain quarter.
   * @param t The quarter to search for. Defaults to the current quarter.
   * @returns The location of the directory.
   */
  getSourcePath(t: Time) {
    return path.join(this.data.directory, "sources", t.toString());
  }

  /**
   * Get the top-level `source` directory.
   */
  getAllSourcePath() {
    return path.join(this.data.directory, "sources");
  }
}
