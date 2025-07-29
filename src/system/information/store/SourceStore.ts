import { readFile, writeFile } from "fs/promises";
import { Time } from "../../../shared/time";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import { getSubFiles, getSubFolders } from "../../util";

/** ------------------------------------------------------------------------- */

class Source extends AbstractItem<Buffer> {
  public readonly group: string;
  public readonly quarter: Time;
  public readonly path: string;

  public constructor(group: string, quarter: Time, path: string) {
    super(Buffer.from(""));

    this.group = group;
    this.quarter = quarter;
    this.path = path;
  }

  hash(): string {
    return this.path;
  }

  async save(): Promise<void> {
    await writeFile(this.path, this.data);
  }

  append(o: Source): void {
    this.data = Buffer.concat([this.data, o.data]);
  }

  protected async fetch() {
    return await readFile(this.path);
  }
}

/** ------------------------------------------------------------------------- */

export class SourceStore extends AbstractStore<Source, Buffer> {
  public sources = new Map<string, Source>();
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather() {
    for (const [time_path, time_str] of await getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new Source(group, time, file_path));
        }
      }
    }
  }

  protected generate(hash: string): Source {
    return new Source("", new Time(1234, 1), hash);
  }
}