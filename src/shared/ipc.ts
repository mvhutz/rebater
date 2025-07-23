import { app, dialog, shell } from "electron";
import { createInterprocess } from "interprocess";
import path from "path";
import fs from 'fs/promises';
import { good, Reply } from "./reply";
import { Settings } from "./settings";
import { SystemStatus } from "./system_status";
import { getTransformers } from "./ipc/system/getTransformers";
import { getSettings } from "./ipc/system/getSettings";
import { openOutputFile } from "./ipc/system/openOutputFile";

/** ------------------------------------------------------------------------- */

const IPC = createInterprocess({
  main: {
    async getPing() {
      const message = "PONG!";
      return message;
    },
    async chooseDir() {
      const directory = await dialog.showOpenDialog({
        properties: ['openDirectory', "createDirectory"]
      });

      return directory.filePaths;
    },
    async openDir(_, filepath: string) {
      shell.showItemInFolder(filepath);
    },
    getTransformers,
    getSettings,
    openOutputFile,
    async setSettings(_, settings: Settings): Promise<Reply<string>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return good(file);
    },
    async runProgram(_, settings?: Settings): Promise<Reply> {
      void [settings];

      return good(undefined);
    },
    async cancelProgram(): Promise<Reply> {
      return good(undefined);
    },
    async answerQuestion(_, answer: Maybe<string>): Promise<Reply> {
      void [answer];

      return good(undefined);
    }
  },
  renderer: {
    async runnerUpdate(_, runner_status: SystemStatus) {
      void [runner_status];
    }
  }
});


/** ------------------------------------------------------------------------- */

export default IPC;