import path from "path";
import { bad, good, Reply } from "../../reply";
import { Time, TimeSchema } from "../../time";
import { FileStore } from "./FileStore";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

interface SourceMeta { group: string, quarter: Time, name: string };

export class SourceStore extends FileStore<Buffer, SourceMeta> {
  protected getFileFromItem(item: SourceMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.group, item.name));
  }

  protected getItemFromFile(file_path: string): Reply<SourceMeta> {
    const [dot, group, quarter, ...names] = path.relative(this.directory, file_path).split(path.sep);
    if (dot == "") {
      return bad("File not in directory!");
    }

    const time_schema = TimeSchema.safeParse(quarter);
    if (!time_schema.success) {
      return bad(`Could not parse time '${quarter}': ${z.prettifyError(time_schema.error)}`);
    }

    return good({ group: group, quarter: new Time(time_schema.data), name: names.join(path.sep) });
  }

  public serialize(data: Buffer): Reply<Buffer> {
    return good(data);
  }

  public deserialize(data: Buffer): Reply<Buffer> {
    return good(data);
  }
}