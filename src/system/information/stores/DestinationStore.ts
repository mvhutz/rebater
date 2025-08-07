import { Time } from "../../../shared/time";
import { getSubFiles, getSubFolders } from "../../util";
import { AbstractStore } from "./AbstractStore";
import { CSVRebateFile } from "../items/CSVRebateFile";

/** ------------------------------------------------------------------------- */

type Item = CSVRebateFile<{ group: string, quarter: Time }>;
interface Meta { directory: string };

/**
 * Holds all rebate data created by the transformers.
 */
export class DestinationStore extends AbstractStore<Item, Meta> {
  public readonly name = "destinations";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new CSVRebateFile(file_path, { quarter: time, group }));
        }
      }
    }
  }
}