import path from "path";
import { bad, good, Reply } from "./reply";
import { type TransformerInfo } from "../system/Transformer";
import z from "zod/v4";
import { Time } from "./time";

/** ------------------------------------------------------------------------- */

/** A settings object, as JSON. */
export type SettingsData = z.infer<typeof Settings.SCHEMA>;

/**
 * Stores various details about the programs configuration.
 */
export class Settings {
  public static readonly SCHEMA = z.object({
    context: z.object({
      year: z.int().positive().optional(),
      quarter: z.int().positive().max(4).optional(),
    }),
    transformers: z.object({
      tags: z.object({
        include: z.array(z.string()).optional()
      }),
      names: z.object({
        include: z.array(z.string()).optional()
      })
    }),
    advanced: z.object({
      target: z.object({
        type: z.literal("basic"),
        directory: z.string().optional(),
      }),
      doTesting: z.boolean().optional(),
      doCompareAll: z.boolean().default(false),
    })
  });

  /** If settings cannot be found, these are what you should give instead. */
  public static readonly DEFAULT_SETTINGS: SettingsData = {
    context: {},
    transformers: {
      tags: {},
      names: {}
    },
    advanced: {
      target: { type: "basic" },
      doCompareAll: false,
    }
  };

  /** The location of Rebater's data. */
  public readonly directory: string;

  /** The current quarter to operate in. */
  public readonly time: Time;

  /** Whether to run a discepancy report, or not. */
  public readonly testing: boolean;

  private data: SettingsData;

  private constructor(directory: string, time: Time, testing: boolean, data: SettingsData) {
    this.directory = directory;
    this.time = time;
    this.testing = testing;
    this.data = data
  }

  /**
   * Based on the settings, should the program consider running this transformer?
   * @param transformer The transformer to check.
   * @returns If it will run, return true.
   */
  willRun(transformer: TransformerInfo): boolean {
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
   * Should the system find differences in all suppliers, or only those that appear in the actual results?
   * @returns True, if you should check all suppliers.
   */
  doCompareAll(): boolean {
    return this.data.advanced.doCompareAll;
  }

  /**
   * Given a reference table, determine where it *should* be location.
   * @param name The name of the reference.
   * @returns The location of the reference.
   */
  getSingleReferencePath(name: string) {
    return path.join(this.directory, "tables", `${name}.csv`);
  }

  /**
   * Find the directory of all reference tables.
   * @returns The location of all reference tables.
   */
  getReferencePath() {
    return path.join(this.directory, "tables");
  }

  /**
   * Given a destination name, figure out where it should be placed.
   * @param name The name of the destination.
   * @returns The location.
   */
  getDestinationPath(name: string) {
    return path.join(this.directory, "rebates", this.time.toString(), `${name}.csv`);
  }

  /**
   * Get the directory holding all destination rebates.
   */
  getAllDestinationPath() {
    return path.join(this.directory, "rebates");
  }

  /**
   * Find specific source files.
   * @param group The specific type of sources to look for.
   * @param file The name of the file you which to find.
   * @param extension The specific extension to look for.
   * @returns A glob string which iterates over all valid source files.
   */
  getSourcePathGlob(group: string, file = "*", extension = "") {
    return path.join(this.directory, "sources", this.time.toString(), group, `**/${file}${extension}`);
  }

  /**
   * Find the location a source file hould go to.
   * @param group The group which the source is a part of.
   * @param t The quarter which the source is for. Defaults to the current quarter.
   * @returns 
   */
  getSingleSourcePath(group: string, t = this.time) {
    return path.join(this.directory, "sources", t.toString(), group);
  }

  /**
   * Get the directory for all sources for a certain quarter.
   * @param t The quarter to search for. Defaults to the current quarter.
   * @returns The location of the directory.
   */
  getSourcePath(t = this.time) {
    return path.join(this.directory, "sources", t.toString());
  }

  /**
   * Get the top-level `source` directory.
   */
  getAllSourcePath() {
    return path.join(this.directory, "sources");
  }

  /**
   * Get a glob of all destination rebates for the current quarter.
   */
  getRebatePathGlob() {
    return path.join(this.directory, "rebates", this.time.toString(), `**/*.csv`);
  }

  /**
   * Get the top-level directory for the expected results.
   */
  getAllTruthPath() {
    return path.join(this.directory, "truth");
  }

  /**
   * Get the top-level directory for utilities.
   */
  getAllUtilityPath() {
    return path.join(this.directory, "utility");
  }

  /**
   * Get the expected location of a utility.
   * @param name The name of the utility.
   * @returns The location.
   */
  getUtilityPath(name: string) {
    return path.join(this.directory, "utility", this.time.toString(), `${name}.csv`);
  }

  /**
   * Get a glob of all expected rebates (truths) for the current quarter.
   */
  getTruthPathGlob() {
    return path.join(this.directory, "truth", this.time.toString(), `**/*.csv`);
  }

  /**
   * Get a glob of all JSON transformers.
   * @deprecated
   */
  getTransformerPathGlob() {
    return path.join(this.directory, 'transformers', '**/*.json');
  }

  /**
   * Get a glob of all XML transformers.
   */
  getTransformerPathXMLGlob() {
    return path.join(this.directory, 'transformers', '**/*.xml');
  }

  /**
   * Get the expected location of a JSON transformer.
   * @param name The name of the transformer.
   */
  getTransformerPath(name: string) {
    return path.join(this.directory, "transformer", `${name}.json`);
  }
  
  /**
   * Get the top-level directory, containing all output files.
   */
  getAllOutputPath() {
    return path.join(this.directory, "upload");
  }

  /**
   * Get the expected location of a specific output file, for the current quarter.
   * @param extension The extension of the output file.
   */
  getOutputFile(extension: string) {
    return path.join(this.directory, "upload", this.time.toString(), `TOTAL.${extension}`);
  }

  /**
   * Attempt to parse settings from JSON.
   * @param json The JSON data to parse.
   * @returns Good, if the data could be parsed.
   */
  public static from(json: unknown): Reply<Settings> {
    const data_parse = Settings.SCHEMA.safeParse(json);
    if (!data_parse.success) {
      return bad(z.prettifyError(data_parse.error));
    }

    const time_parse = Time.SCHEMA.safeParse(data_parse.data.context);
    let time: Time;
    if (!time_parse.success) {
      time = new Time(0, 1);
    } else {
      time = time_parse.data;
    }

    const { target: {directory}, doTesting = false } = data_parse.data.advanced;
    if (directory == null) return bad("You must specify a target directory.");


    const iface = new Settings(directory, time, doTesting, data_parse.data);
    return good(iface);
  }
}
