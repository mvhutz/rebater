import { Time } from "../../../shared/time";
import { getSubFiles, getSubFolders } from "../../util";
import { AbstractStore } from "./AbstractStore";
import { CSVRebateFile } from "../items/CSVRebateFile";

/** ------------------------------------------------------------------------- */

type Item = CSVRebateFile<{ quarter: Time }>;
interface Meta { directory: string };

/**
 * Holds all rebate files which are used to run discrepancy reports on.
 */
export class TruthStore extends AbstractStore<Item, Meta> {
  public readonly name = "truths";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [file_path] of await getSubFiles(time_path)) {
        this.add(new CSVRebateFile(file_path, { quarter: time }));
      }
    }
  }
}