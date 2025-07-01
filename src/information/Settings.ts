import path from "node:path";
import fs from "node:fs/promises";

/** ------------------------------------------------------------------------- */

export abstract class Settings {
  public abstract getReferencePath(name: string): string;

  public abstract listDestinationPaths(group: string, subgroup: string, time: Time): Promise<string[]>;
  public abstract getDestinationPath(name: string, group: string, subgroup: string, time: Time): string;

  public abstract listSourcePaths(group: string, subgroup: string, time: Time, extension?: string): Promise<string[]>;

  public abstract listExpectedGroups(): Promise<string[]>;
  public abstract listExpectedPaths(group: string): Promise<string[]>;
  public abstract listActualGroups(): Promise<string[]>;
  public abstract listActualPaths(group: string): Promise<string[]>;

  public abstract listTransformerPaths(): Promise<string[]>;
  public abstract getTransformerPath(name: string): string;
}

export class BasicSettings extends Settings {
  private directory: string;

  constructor(directory: string) {
    super();
    
    this.directory = directory;
  }

  public getReferencePath(name: string): string {
    return path.join(this.directory, "tables", `${name}.csv`);
  }

  public async listDestinationPaths(group: string, subgroup: string): Promise<string[]> {
    const folder = path.join(
      this.directory,
      group,
      subgroup,
      `**/*.csv`
    );

    return await Array.fromAsync(fs.glob(folder));
  }

  public getDestinationPath(filepath: string, group: string, subgroup: string): string {
    return path.join(
      this.directory,
      group,
      subgroup,
      `${path.parse(filepath).name}.csv`
    );
  }

  public async listExpectedGroups(): Promise<string[]> {
    const folder = path.join(
      this.directory,
      "truth",
    );

    return await fs.readdir(folder);
  }

  public async listExpectedPaths(group: string): Promise<string[]> {
    const folder = path.join(
      this.directory,
      "truth",
      group,
      "**/*.csv"
    );

    return await Array.fromAsync(fs.glob(folder));
  }

  public async listActualGroups(): Promise<string[]> {
    const folder = path.join(
      this.directory,
      "rebates",
    );

    return await fs.readdir(folder);
  }

  public async listActualPaths(group: string): Promise<string[]> {
    const folder = path.join(
      this.directory,
      "rebates",
      group,
      "**/*.csv"
    );

    return await Array.fromAsync(fs.glob(folder));
  }

  public async listSourcePaths(group: string, subgroup: string, time: Time, extension = ""): Promise<string[]> {
    const folder = path.join(
      this.directory,
      group,
      subgroup,
      time.year.toString(),
      `Q${time.quarter.toString()}`,
      `**/*${extension}`
    );

    return await Array.fromAsync(fs.glob(folder));
  }

  public async listTransformerPaths(): Promise<string[]> {
    const folder = path.join(
      this.directory,
      'transformers',
      '**/*.json'
    );

    return await Array.fromAsync(fs.glob(folder));
  }

  public getTransformerPath(name: string): string {
    return path.join(this.directory, "transformer", `${name}.json`);
  }
}