import { app } from "electron";
import { bad, good, Reply } from "../../reply";
import path from "path";
import { existsSync } from "fs";
import { lstat, readFile } from "fs/promises";
import z from "zod/v4";
import { Settings, SettingsData, SettingsSchema } from "../../settings";

/** ------------------------------------------------------------------------- */

/**
 * Fetches the app settings from the file system.
 * @returns The settings JSON. Not the class.
 */
export async function getSettings(): Promise<Reply<SettingsData>> {
  const file = path.join(app.getPath("userData"), "settings.json");

  // Return the default settings, if the file does not exist.
  if (!existsSync(file)) {
    return bad("No file!");
  }

  // Should only be a file.
  const stat = await lstat(file);
  if (!stat.isFile()) {
    return bad("File not found in settings location.");
  }

  // Parse data.
  const raw = await readFile(file, 'utf-8');
  const json: unknown = JSON.parse(raw);
  const parsed = SettingsSchema.safeParse(json);

  if (!parsed.success) {
    return bad(z.prettifyError(parsed.error));
  } else {
    return good(parsed.data);
  }
}

/**
 * Fetches and parses the settings JSON into the class.
 * @returns The settings class, not the data.
 */
export async function getSettingsInterface(): Promise<Reply<Settings>> {
  const settings_reply = await getSettings(); 
  if (!settings_reply.ok) return settings_reply;

  const { data: settings } = settings_reply;
  return good(new Settings(settings));
}
