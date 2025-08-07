import { shell } from "electron";

/** ------------------------------------------------------------------------- */

/**
 * Opens a directory in the user's file system.
 * @param filepath The directory to open.
 */
export async function openDir(_: unknown, filepath: string) {
  shell.showItemInFolder(filepath);
}