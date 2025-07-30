import { Time } from "../../shared/time";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractStore } from "./AbstractStore";
import { Rebate } from "../../shared/worker/response";
import { ExcelRebateFile } from "./RebateFile";

/** ------------------------------------------------------------------------- */

export class OutputStore extends AbstractStore<ExcelRebateFile<{ quarter: Time }>, Rebate[]> {
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
        this.add(new ExcelRebateFile(file_path, { quarter: time }));
      }
    }
  }
}