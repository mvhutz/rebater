import { Time } from "../../../shared/time";
import { good, Reply } from "../../reply";
import { AbstractFile } from "./AbstractFile";

interface Meta { group: string, quarter: Time };

/**
 * An AbstractFile which holds source data.
 */
export class SourceFile extends AbstractFile<Buffer> {
  public meta: Meta;

  constructor(path: string, meta: Meta) {
    super(path);
    this.meta = meta;
  }

  serialize(data: Buffer): Buffer {
    return data;
  }

  deserialize(data: Buffer): Reply<Buffer<ArrayBufferLike>> {
    return good(data);
  }

  insert(datum: Buffer): void {
    if (!this.data.ok) return;
    this.data = good(Buffer.concat([this.data.data, datum]));
  }
}