import path from "path";
import { good, Replier, Reply } from "../../reply";
import { Time } from "../../time";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

interface SourceMeta { group: string, quarter: Time, name: string };

export class SourceStore extends FileStore<Buffer, SourceMeta> {
  protected getFileFromItem(item: SourceMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.group, item.name));
  }

  protected getItemFromFile(file_path: string): Reply<SourceMeta> {
    const [quarter, group, ...names] = path.relative(this.directory, file_path).split(path.sep);

    return Replier.of(Time.parse(quarter))
      .map(t => ({ group: group, quarter: t, name: names.join(path.sep) }))
      .end();
  }

  public serialize(data: Buffer): Reply<Buffer> {
    return good(data);
  }

  public deserialize(data: Buffer): Reply<Buffer> {
    return good(data);
  }
}