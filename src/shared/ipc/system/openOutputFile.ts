import { getSettingsInterface } from "./getSettings";
import { existsSync } from "fs";
import { bad, good } from "../../reply";
import { shell } from "electron";

/** ------------------------------------------------------------------------- */

/**
 * Find the output Excel file, and open it for the user.
 */
export async function openOutputFile() {
  // Get settings.
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const file = isettings.getOutputFile("xlsx");
  if (!existsSync(file)) return bad("Output file does not exist.");

  shell.showItemInFolder(file);
  return good("Shown!");
}