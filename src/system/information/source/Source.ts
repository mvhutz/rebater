import { readFile } from "fs/promises";
import { Time } from "../../../shared/time";

/** ------------------------------------------------------------------------- */

export class Source {
  public readonly group: string;
  public readonly quarter: Time;
  public readonly path: string;

  private data?: Buffer;

  public constructor(group: string, quarter: Time, path: string) {
    this.group = group;
    this.quarter = quarter;
    this.path = path;
  }

  public async load(): Promise<void> {
    const data = await readFile(this.path);
    this.data = data;
  }

  public getData(): Maybe<Buffer> {
    return this.data;
  }
}