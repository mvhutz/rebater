import path from "path";
import { bad, good, Reply } from "./reply";
import { TransformerData } from "../system/transformer";
import z from "zod/v4";
import { Time } from "./time";

/** ------------------------------------------------------------------------- */

export type SettingsData = z.infer<typeof Settings.SCHEMA>;

export const DEFAULT_SETTINGS: SettingsData = {
  context: {},
  transformers: {
    tags: {},
    names: {}
  },
  advanced: {
    target: { type: "basic" },
  }
};

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
    })
  });

  public readonly directory: string;
  public readonly time: Time;
  public readonly testing: boolean;

  private data: SettingsData;

  private constructor(directory: string, time: Time, testing: boolean, data: SettingsData) {
    this.directory = directory;
    this.time = time;
    this.testing = testing;
    this.data = data
  }

  willRun(transformer: TransformerData): boolean {
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

  getTime(): Time {
    return this.time;
  }

  doTesting(): boolean {
    return this.testing;
  }

  getSingleReferencePath(name: string) {
    return path.join(this.directory, "tables", `${name}.csv`);
  }

  getReferencePath() {
    return path.join(this.directory, "tables");
  }

  getDestinationPath(name: string) {
    return path.join(this.directory, "rebates", this.time.toString(), `${name}.csv`);
  }

  getSourcePathGlob(group: string, file = "*", extension = "") {
    return path.join(this.directory, "sources", this.time.toString(), group, `**/${file}${extension}`);
  }

  getSingleSourcePath(group: string, t = this.time) {
    return path.join(this.directory, "sources", t.toString(), group);
  }

  getSourcePath(t = this.time) {
    return path.join(this.directory, "sources", t.toString());
  }

  getAllSourcePath() {
    return path.join(this.directory, "sources");
  }

  getRebatePathGlob() {
    return path.join(this.directory, "rebates", this.time.toString(), `**/*.csv`);
  }

  getTruthPathGlob() {
    return path.join(this.directory, "truth", this.time.toString(), `**/*.csv`);
  }

  getTransformerPathGlob() {
    return path.join(this.directory, 'transformers', '**/*.json');
  }

  getTransformerPath(name: string) {
    return path.join(this.directory, "transformer", `${name}.json`);
  }

  getOutputFile(extension: string) {
    return path.join(this.directory, "upload", this.time.toString(), `TOTAL.${extension}`);
  }

  public static from(json: unknown): Reply<Settings> {
    const data_parse = Settings.SCHEMA.safeParse(json);
    if (!data_parse.success) {
      return bad(z.prettifyError(data_parse.error));
    }

    const time_parse = Time.SCHEMA.safeParse(data_parse.data.context);
    if (!time_parse.success) {
      return bad(z.prettifyError(time_parse.error));
    }

    const { target: {directory}, doTesting = false } = data_parse.data.advanced;
    if (directory == null) return bad("You must specify a target directory.");


    const iface = new Settings(directory, time_parse.data, doTesting, data_parse.data);
    return good(iface);
  }
}
