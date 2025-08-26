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
   * Find the directory of all reference tables.
   * @returns The location of all reference tables.
   */
  getReferencePath() {
    return path.join(this.data.directory, "tables");
  }

  /**
   * Given a destination name, figure out where it should be placed.
   * @param name The name of the destination.
   * @returns The location.
   */
  getDestinationPath(name: string) {
    return path.join(this.data.directory, "rebates", this.time.toString(), `${name}.csv`);
  }

  /**
   * Get the directory holding all destination rebates.
   */
  getAllDestinationPath() {
    return path.join(this.data.directory, "rebates");
  }

  /**
   * Find specific source files.
   * @param group The specific type of sources to look for.
   * @param file The name of the file you which to find.
   * @param extension The specific extension to look for.
   * @returns A glob string which iterates over all valid source files.
   */
  getSourcePathGlob(group: string, file = "*", extension = "") {
    return path.join(this.data.directory, "sources", this.time.toString(), group, `**/${file}${extension}`);
  }

  /**
   * Find the location a source file hould go to.
   * @param group The group which the source is a part of.
   * @param t The quarter which the source is for. Defaults to the current quarter.
   * @returns 
   */
  getSingleSourcePath(group: string, t = this.time) {
    return path.join(this.data.directory, "sources", t.toString(), group);
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
   * Get a glob of all destination rebates for the current quarter.
   */
  getRebatePathGlob() {
    return path.join(this.data.directory, "rebates", this.time.toString(), `**/*.csv`);
  }

  /**
   * Get the top-level directory for the expected results.
   */
  getAllTruthPath() {
    return path.join(this.data.directory, "truth");
  }

  /**
   * Get the top-level directory for utilities.
   */
  getAllUtilityPath() {
    return path.join(this.data.directory, "utility");
  }

  /**
   * Get the expected location of a utility.
   * @param name The name of the utility.
   * @returns The location.
   */
  getUtilityPath(name: string) {
    return path.join(this.data.directory, "utility", this.time.toString(), `${name}.csv`);
  }

  /**
   * Get a glob of all expected rebates (truths) for the current quarter.
   */
  getTruthPathGlob() {
    return path.join(this.data.directory, "truth", this.time.toString(), `**/*.csv`);
  }

  /**
   * Get a glob of all JSON transformers.
   */
  getTransformerPathGlob() {
    return path.join(this.data.directory, 'transformers', '**/*.json');
  }

  /**
   * Get the expected location of a JSON transformer.
   * @param name The name of the transformer.
   */
  getTransformerPath(name: string) {
    return path.join(this.data.directory, "transformers", `${name}.json`);
  }
  
  /**
   * Get the  location of all transformers.
   */
  getAllTransformerPath() {
    return path.join(this.data.directory, "transformers");
  }
  
  /**
   * Get the top-level directory, containing all output files.
   */
  getAllOutputPath() {
    return path.join(this.data.directory, "upload");
  }

  /**
   * Get the expected location of a specific output file, for the current quarter.
   * @param extension The extension of the output file.
   */
  getOutputFile(extension: string) {
    return path.join(this.data.directory, "upload", this.time.toString(), `TOTAL.${extension}`);
  }
}
