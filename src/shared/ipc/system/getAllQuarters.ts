import { bad, good, Reply } from "../../reply";
import { readdir } from "fs/promises";
import { getSettingsInterface } from "./getSettings";
import { Time, TimeData } from "../../../shared/time";
import { existsSync } from "fs";

/** ------------------------------------------------------------------------- */

/**
 * Searches the sources directory, and finds all sources available.
 * @returns All quarters found.
 */
export async function getAllQuarters(): Promise<Reply<TimeData[]>> {
  // Get settings.
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const quarters = new Array<TimeData>();

  if (!existsSync(isettings.getAllSourcePath())) {
    return good([]);
  }

  try {
    // Read all top level folders in the sources folder for valid names.
    for (const directory of await readdir(isettings.getAllSourcePath(), {
      withFileTypes: true
    })) {
      if (!directory.isDirectory()) continue;

      const time = Time.parse(directory.name);
      if (!time.ok) continue;

      quarters.push(time.data.toJSON());
    }
    return good(quarters);
  } catch (err) {
    return bad(`${err}`);
  }
}