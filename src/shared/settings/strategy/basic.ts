import path from "path";
import fs from "fs/promises";
import { z } from "zod/v4";
import SettingsStrategy from "./base";

/** ------------------------------------------------------------------------- */

export type BasicSettingsStrategyData = z.input<typeof BasicSettingsStrategy.Schema>;

export default class BasicSettingsStrategy extends SettingsStrategy {
  public static readonly Schema = z.object({
    type: z.literal("basic"),
    directory: z.string()
  });

  public readonly data: BasicSettingsStrategyData;

  constructor(data: BasicSettingsStrategyData) {
    super();
    
    this.data = data;
  }

  getReferencePath(name: string): string {
    return path.join(this.data.directory, "tables", `${name}.csv`);
  }

  getDestinationPath(name: string, time: Time): string {
    return path.join(
      this.data.directory,
      "rebates",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `${name}.csv`
    );
  }

  getSourcePathGlob(group: string, time: Time, extension = ""): string {
    return path.join(
      this.data.directory,
      "sources",
      group,
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*${extension}`
    );
  }

  public async getRebatePaths(time: Time): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "rebates",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*.csv`
    );

    return Array.fromAsync(fs.glob(folder));
  }

  public async getTruthPaths(time: Time): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "truth",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*.csv`
    );

    return Array.fromAsync(fs.glob(folder));
  }

  async listTransformerPaths(): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      'transformers',
      '**/*.json'
    );

    return Array.fromAsync(fs.glob(folder));
  }

  getTransformerPath(name: string): string {
    return path.join(this.data.directory, "transformer", `${name}.json`);
  }

  getOutputFile(time: Time, extension: string): string {
    return path.join(
      this.data.directory,
      "upload",
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `TOTAL.${extension}`
    );
  }
}
