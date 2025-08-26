import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem } from "./AbstractItem";
import { bad, Reply } from "../../reply";

/** ------------------------------------------------------------------------- */

/**
 * An Abstract item, specifically gears towards file data.
 */
export abstract class AbstractFile<Data> extends AbstractItem<Reply<Data>> {
  /** The path of the file data. */
  public readonly path: string;

  public constructor(path: string) {
    super(bad("Not loaded!"));

    this.path = path;
  }

  hash(): string {
    // The path of the file is the unique identifier.
    return this.path;
  }


  /**
   * Add some datum to the current data within this item.
   * @param datum 
   */
  abstract insert(datum: Data): void;

  /**
   * Push multiple set of data into the item.
   * @param data The set of data to push.
   */
  public push(...data: Data[]) {
    for (const datum of data) {
      this.insert(datum);
    }
  }

  /**
   * Add the data of other abstract items into this item.
   * @param others The other items.
   */
  public add(...others: AbstractFile<Data>[]) {
    for (const other of others) {
      if (other.data.ok) {
        this.push(other.data.data);
      }
    }
  }

  /**
   * Convert the data of this item into Buffer data.
   */
  abstract serialize(data: Data): Buffer;

  /**
   * Load serialized buffer data into this item.
   * @param data The serialized data.
   */
  abstract deserialize(data: Buffer): Reply<Data>;

  async save(): Promise<void> {
    if (this.data.ok) {
      const csv = this.serialize(this.data.data);
      await mkdir(path.dirname(this.path), { recursive: true });
      await writeFile(this.path, csv);
    }
  }

  protected async fetch(): Promise<Reply<Data>> {
    const file = await readFile(this.path);
    return this.deserialize(file);
  }
}