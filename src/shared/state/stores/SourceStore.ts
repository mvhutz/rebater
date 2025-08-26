import { Time } from "../../../shared/time";
import { SourceFile } from "../items/SourceFile";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

/**
 * Holds all the sources pulled by the transformers.
 */
export class SourceStore extends FileStore<SourceFile> {
  public readonly name = "sources";

  public async gather() {
    for (const [time_path, time_str] of await FileStore.getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await FileStore.getSubFolders(time_path)) {
        for (const [file_path] of await FileStore.getSubFiles(group_path)) {
          this.add(new SourceFile(file_path, { group, quarter: time }));
        }
      }
    }
  }
}