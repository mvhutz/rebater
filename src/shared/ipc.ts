import { app, dialog, shell } from "electron";
import { createInterprocess } from "interprocess";
import path from "path";
import fs from 'fs/promises';
import { good, Reply } from "./reply";
import { getTransformers } from "./ipc/system/getTransformers";
import { getSettings } from "./ipc/system/getSettings";
import { openOutputFile } from "./ipc/system/openOutputFile";
import { getAllQuarters } from "./ipc/system/getAllQuarters";
import { createQuarter } from "./ipc/system/createQuarter";
import { SettingsData } from "./settings";
import { SystemStatus } from "./worker/response";

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
    getAllQuarters,
    createQuarter,
    async setSettings(_, settings: SettingsData): Promise<Reply<string>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return good(file);
    },
    async runProgram(_, settings?: SettingsData): Promise<Reply> {
      void [settings];

      return good(undefined);
    },
    async cancelProgram(): Promise<Reply> {
      return good(undefined);
    },
    async answerQuestion(_, answer: { question: string, value: Maybe<string> }): Promise<Reply> {
      void [answer];

      return good(undefined);
    },
    async ignoreAll(): Promise<Reply> {
      void [];

      return good(undefined);
    }
  },
  renderer: {
    async runnerUpdate(_, runner_status: SystemStatus) {
      void [runner_status];
    },
    async runnerQuestion(_, question: string) {
      void [question];
    }
  }
});


/** ------------------------------------------------------------------------- */

export default IPC;