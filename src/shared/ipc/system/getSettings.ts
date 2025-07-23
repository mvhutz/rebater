import { app } from "electron";
import { bad, good, Reply } from "../../reply";
import { DEFAULT_SETTINGS, Settings, SettingsSchema } from "../../settings";
import path from "path";
import { existsSync } from "fs";
import { lstat, readFile } from "fs/promises";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

export async function getSettings(): Promise<Reply<Settings>> {
  const file = path.join(app.getPath("userData"), "settings.json");
  if (!existsSync(file)) {
    return good(DEFAULT_SETTINGS);
  }

  const stat = await lstat(file);
  if (!stat.isFile()) {
    return bad("File not found in settings location.");
  }

  const raw = await readFile(file, 'utf-8');
  const json = JSON.parse(raw);
  const parsed = SettingsSchema.safeParse(json);
  if (!parsed.success) {
    return bad(z.prettifyError(parsed.error));
  } else {
    return good(parsed.data);
  }
}