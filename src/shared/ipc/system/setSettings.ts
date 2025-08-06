import { app } from "electron";
import path from "path";
import { SettingsData } from "../../settings";
import { good, Reply } from "../../reply";
import { writeFile } from "fs/promises";

/** ------------------------------------------------------------------------- */

/**
 * Set the current settings.
 * @param settings The data to set the settings to.
 */
export async function setSettings(_: unknown, settings: SettingsData): Promise<Reply<string>> {
  const file = path.join(app.getPath("userData"), "settings.json");
  await writeFile(file, JSON.stringify(settings));
  return good(file);
}