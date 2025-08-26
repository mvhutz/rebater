import { Time } from "../../../shared/time";
import { CSVRebateFile } from "../items/CSVRebateFile";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

interface Meta { group: string, quarter: Time };

export class DestinationFile extends CSVRebateFile {
  public meta: Meta;

  constructor(path: string, meta: Meta) {
    super(path);

    this.meta = meta;
  }
}

/** ------------------------------------------------------------------------- */


/**
 * Holds all rebate data created by the transformers.
 */
export class DestinationStore extends FileStore<DestinationFile> {
  public readonly name = "destinations";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await FileStore.getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await FileStore.getSubFolders(time_path)) {
        for (const [file_path] of await FileStore.getSubFiles(group_path)) {
          this.add(new DestinationFile(file_path, { quarter: time, group }));
        }
      }
    }
  }
}