import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem } from "./AbstractItem";

/** ------------------------------------------------------------------------- */

/**
 * An Abstract item, specifically gears towards file data.
 */
export abstract class AbstractFile<Data, Meta> extends AbstractItem<Data> {
  /** The path of the file data. */
  public readonly path: string;

  /** The metadata of the particular item. */
  public readonly meta: Meta;

  public constructor(path: string, initial: Data, meta: Meta) {
    super(initial);

    this.path = path;
    this.meta = meta;
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