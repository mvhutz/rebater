import { Time } from "../../shared/time";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractStore } from "./AbstractStore";
import { ExcelRebateFile } from "./items/ExcelRebateFile";

/** ------------------------------------------------------------------------- */

type Item = ExcelRebateFile<{ quarter: Time }>;
interface Meta { directory: string };

export class OutputStore extends AbstractStore<Item, Meta> {
  public readonly name = "outputs";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [file_path] of await getSubFiles(time_path)) {
        this.add(new ExcelRebateFile(file_path, { quarter: time }));
      }
    }
  }
}