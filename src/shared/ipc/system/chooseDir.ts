import { dialog } from "electron";

/** ------------------------------------------------------------------------- */

/**
 * Prompts the user to choose a directory from their file system.
 * @returns All paths chosen.
 */
export async function chooseDir() {
  const directory = await dialog.showOpenDialog({
    properties: ['openDirectory', "createDirectory"]
  });

  return directory.filePaths;
}