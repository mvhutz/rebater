import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

export const Schema = z.object({
  type: z.literal("basic"),
  directory: z.string()
});

export type Data = z.infer<typeof Schema>;

export const Operations = {
  getReferencePath(data: Data, name: string): string {
    return path.join(data.directory, "tables", `${name}.csv`);
  },
  async listDestinationPaths(data: Data, group: string, subgroup: string): Promise<string[]> {
    const folder = path.join(
      data.directory,
      group,
      subgroup,
      `**/*.csv`
    );

    return await Array.fromAsync(fs.glob(folder));
  },
  getDestinationPath(data: Data, filepath: string, group: string, subgroup: string): string {
    return path.join(
      data.directory,
      group,
      subgroup,
      `${path.parse(filepath).name}.csv`
    );
  },
  async listExpectedGroups(data: Data): Promise<string[]> {
    const folder = path.join(
      data.directory,
      "truth",
    );

    return await fs.readdir(folder);
  },
  async listExpectedPaths(data: Data, group: string): Promise<string[]> {
    const folder = path.join(
      data.directory,
      "truth",
      group,
      "**/*.csv"
    );

    return await Array.fromAsync(fs.glob(folder));
  },
  async listActualGroups(data: Data): Promise<string[]> {
    const folder = path.join(
      data.directory,
      "rebates",
    );

    return await fs.readdir(folder);
  },
  async listActualPaths(data: Data, group: string): Promise<string[]> {
    const folder = path.join(
      data.directory,
      "rebates",
      group,
      "**/*.csv"
    );

    return await Array.fromAsync(fs.glob(folder));
  },
  async listSourcePaths(data: Data, group: string, subgroup: string, time: Time, extension = ""): Promise<string[]> {
    const folder = path.join(
      data.directory,
      group,
      subgroup,
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*${extension}`
    );

    return await Array.fromAsync(fs.glob(folder));
  },
  async listTransformerPaths(data: Data): Promise<string[]> {
    const folder = path.join(
      data.directory,
      'transformers',
      '**/*.json'
    );

    return await Array.fromAsync(fs.glob(folder));
  },
  getTransformerPath(data: Data, name: string): string {
    return path.join(data.directory, "transformer", `${name}.json`);
  },
  getOutputFile(data: Data): string {
    return path.join(data.directory, "OUTPUT.xlsx");
  },
}