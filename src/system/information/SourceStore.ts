import { Time } from "../../shared/time";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractFile } from "./RebateFile";

/** ------------------------------------------------------------------------- */

class Source extends AbstractFile<Buffer, { group: string, quarter: Time }> {
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

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

export class SourceStore extends AbstractStore<Source, Buffer, Meta> {
  public async gather() {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new Source(file_path, { group, quarter: time }));
        }
      }
    }
  }
}