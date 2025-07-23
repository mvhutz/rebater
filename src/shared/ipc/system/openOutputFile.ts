import { getSettings } from "./getSettings";
import { makeSettingsInterface } from "../../settings_interface";
import { existsSync } from "fs";
import { bad, good } from "../../reply";
import { shell } from "electron";

/** ------------------------------------------------------------------------- */

export async function openOutputFile() {
  const settings_reply = await getSettings(); 
  if (!settings_reply.ok) return settings_reply;

  const { data: settings } = settings_reply;

  const isettings_reply = makeSettingsInterface(settings);
  if (!isettings_reply.ok) return isettings_reply;

  const { data: isettings } = isettings_reply;

  const file = isettings.getOutputFile("xlsx");
  if (!existsSync(file)) return bad("Output file does not exist.");

  shell.showItemInFolder(file);
  return good("Shown!");
}