import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem } from "./AbstractItem";

/** ------------------------------------------------------------------------- */

export abstract class AbstractFile<Data, Meta> extends AbstractItem<Data> {
  public readonly path: string;
  public readonly meta: Meta;

  public constructor(path: string, initial: Data, meta: Meta) {
    super(initial);

    this.path = path;
    this.meta = meta;
  }

  hash(): string {
    return this.path;
  }

  abstract serialize(): Buffer;
  abstract deserialize(data: Buffer): Data;

  async save(): Promise<void> {
    const csv = this.serialize();
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, csv);
  }

  abstract insert(datum: Data): void;

  protected async fetch(): Promise<Data> {
    const file = await readFile(this.path);
    return this.deserialize(file);
  }
}