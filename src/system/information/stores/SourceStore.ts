import { Time } from "../../../shared/time";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles, getSubFolders } from "../../util";
import { SourceFile } from "../items/SourceFile";

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

/**
 * Holds all the sources pulled by the transformers.
 */
export class SourceStore extends AbstractStore<SourceFile, Meta> {
  public readonly name = "sources";

  public async gather() {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new SourceFile(file_path, { group, quarter: time }));
        }
      }
    }
  }
}