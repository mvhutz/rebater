import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod/v4";
import SettingsStrategy from "./base";
import { glob } from "glob";

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

  async listDestinationPaths(group: string, subgroup: string): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      group,
      subgroup,
      `**/*.csv`
    );

    return await glob(folder);
  }

  getDestinationPath(filepath: string, group: string, subgroup: string, time: Time): string {
    return path.join(
      this.data.directory,
      group,
      subgroup,
      `${path.parse(filepath).name}.csv`
    );
  }

  async listExpectedGroups(): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "truth",
    );

    return await fs.readdir(folder);
  }

  async listExpectedPaths(group: string): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "truth",
      group,
      "**/*.csv"
    );

    return await glob(folder);
  }

  async listActualGroups(): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "rebates",
    );

    return await fs.readdir(folder);
  }

  async listActualPaths(group: string): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      "rebates",
      group,
      "**/*.csv"
    );

    return await glob(folder);
  }

  async listSourcePaths(group: string, subgroup: string, time: Time, extension = ""): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      group,
      subgroup,
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*${extension}`
    );

    return await glob(folder);
  }

  async listTransformerPaths(): Promise<string[]> {
    const folder = path.join(
      this.data.directory,
      'transformers',
      '**/*.json'
    );

    return await glob(folder);
  }

  getTransformerPath(name: string): string {
    return path.join(this.data.directory, "transformer", `${name}.json`);
  }

  getOutputFile(): string {
    return path.join(this.data.directory, "OUTPUT.xlsx");
  }
}
