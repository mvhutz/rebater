import { Time } from "../../../shared/time";
import { AbstractFile } from "./AbstractFile";

interface Meta { group: string, quarter: Time };

/**
 * An AbstractFile which holds source data.
 */
export class SourceFile extends AbstractFile<Buffer> {
  public meta: Meta;

  constructor(path: string, meta: Meta) {
    super(path, Buffer.from(""));
    this.meta = meta;
  }

  serialize(): Buffer {
    return this.data;
  }

  deserialize(data: Buffer): Buffer<ArrayBufferLike> {
    return data;
  }

  insert(datum: Buffer<ArrayBufferLike>): void {
    this.data = Buffer.concat([this.data, datum]);
  }
}