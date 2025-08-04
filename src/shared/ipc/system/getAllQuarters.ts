import { good, Reply } from "../../reply";
import { readdir } from "fs/promises";
import moment from "moment";
import { getSettingsInterface } from "./getSettings";
import { TimeData } from "../../../shared/time";

/** ------------------------------------------------------------------------- */

const SOURCE_FOLDER_FORMAT = "YYYY-QQ";

export async function getAllQuarters(): Promise<Reply<TimeData[]>> {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const directories = await readdir(isettings.getAllSourcePath(), { withFileTypes: true });
  const quarters = new Array<TimeData>();
  for (const directory of directories) {
    if (!directory.isDirectory()) continue;

    const time = moment(directory.name, SOURCE_FOLDER_FORMAT);
    if (!time.isValid()) continue;

    const quarter = time.quarter();
    if (quarter !== 1 && quarter !== 2 && quarter !== 3 && quarter !== 4) continue;

    quarters.push({ year: time.year(), quarter });
  }

  return good(quarters);
}