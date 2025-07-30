import { Time } from "../../shared/time";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractStore } from "./AbstractStore";
import { Rebate } from "../../shared/worker/response";
import { CSVRebateFile } from "./RebateFile";

/** ------------------------------------------------------------------------- */

export class Destination extends CSVRebateFile {
  public readonly group: string;
  public readonly quarter: Time;

  public constructor(group: string, quarter: Time, path: string) {
    super(path);

    this.group = group;
    this.quarter = quarter;
  }
}

/** ------------------------------------------------------------------------- */

export class DestinationStore extends AbstractStore<Destination, Rebate[]> {
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new Destination(group, time, file_path));
        }
      }
    }
  }
}