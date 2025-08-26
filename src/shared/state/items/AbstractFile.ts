import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem } from "./AbstractItem";

/** ------------------------------------------------------------------------- */

/**
 * An Abstract item, specifically gears towards file data.
 */
export abstract class AbstractFile<Data> extends AbstractItem<Data> {
  /** The path of the file data. */
  public readonly path: string;

  public constructor(path: string, initial: Data) {
    super(initial);

    this.path = path;
  }

  hash(): string {
    // The path of the file is the unique identifier.
    return this.path;
  }

  /**
   * Convert the data of this item into Buffer data.
   */
  abstract serialize(): Buffer;

  /**
   * Load serialized buffer data into this item.
   * @param data The serialized data.
   */
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