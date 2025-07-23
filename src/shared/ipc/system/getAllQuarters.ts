import { bad, good, Reply } from "../../reply";
import { readdir } from "fs/promises";
import moment from "moment";
import { getSettingsInterface } from "./getSettings";

/** ------------------------------------------------------------------------- */

const SOURCE_FOLDER_FORMAT = "YYYY-QQ";

export async function getAllQuarters(): Promise<Reply<Time[]>> {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const directories = await readdir(isettings.getAllSourcePath(), { withFileTypes: true });
  const quarters = new Array<Time>();
  for (const directory of directories) {
    if (!directory.isDirectory()) continue;

    const time = moment(directory.name, SOURCE_FOLDER_FORMAT);
    if (!time.isValid()) {
      return bad(`Time ${directory.name} is not a valid quarter!`);
    }

    const quarter = time.quarter();
    if (quarter !== 1 && quarter !== 2 && quarter !== 3 && quarter !== 4) {
      return bad(`Quarter ${quarter} is not a valid quarter!`);
    }

    quarters.push({ year: time.year(), quarter });
  }

  return good(quarters);
}