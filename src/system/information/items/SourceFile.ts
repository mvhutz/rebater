import { Time } from "../../../shared/time";
import { AbstractFile } from "./AbstractFile";

/**
 * An AbstractFile which holds source data.
 */
export class SourceFile extends AbstractFile<Buffer, { group: string, quarter: Time }> {
  constructor(path: string, meta: { group: string, quarter: Time }) {
    super(path, Buffer.from(""), meta);
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