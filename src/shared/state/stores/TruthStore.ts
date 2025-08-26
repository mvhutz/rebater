import { Time } from "../../../shared/time";
import { CSVRebateFile } from "../items/CSVRebateFile";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

interface Meta { quarter: Time };

class TruthFile extends CSVRebateFile {
  public meta: Meta;

  constructor(path: string, meta: Meta) {
    super(path);

    this.meta = meta;
  }
}

/** ------------------------------------------------------------------------- */

/**
 * Holds all rebate files which are used to run discrepancy reports on.
 */
export class TruthStore extends FileStore<TruthFile> {
  public readonly name = "truths";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await FileStore.getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [file_path] of await FileStore.getSubFiles(time_path)) {
        this.add(new TruthFile(file_path, { quarter: time }));
      }
    }
  }
}