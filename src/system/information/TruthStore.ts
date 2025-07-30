import { Time } from "../../shared/time";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractStore } from "./AbstractStore";
import { Rebate } from "../../shared/worker/response";
import { CSVRebateFile } from "./RebateFile";

/** ------------------------------------------------------------------------- */

export class TruthStore extends AbstractStore<CSVRebateFile<{ quarter: Time }>, Rebate[]> {
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [file_path] of await getSubFiles(time_path)) {
        this.add(new CSVRebateFile(file_path, { quarter: time }));
      }
    }
  }
}