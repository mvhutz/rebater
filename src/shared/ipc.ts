import { app, dialog } from "electron";
import { createInterprocess } from "interprocess";
import path from "path";
import { existsSync } from "fs";
import fs from 'fs/promises';
import { type RunnerStatus } from "../system/Runner";
import Settings, { type SettingsData } from "./settings";

/** ------------------------------------------------------------------------- */

const IPC = createInterprocess({
  main: {
    async getPing() {
      const message = "PONG!";
      console.log("PING!");
      return message;
    },
    async chooseDir() {
      const directory = await dialog.showOpenDialog({
        properties: ['openDirectory', "createDirectory"]
      });

      return directory.filePaths;
    },
    async getSettings(): Promise<SettingsData | undefined> {
      const file = path.join(app.getPath("userData"), "settings.json");
      if (!existsSync(file)) {
        return undefined;
      }

      const stat = await fs.lstat(file);
      if (!stat.isFile()) {
        throw Error("File not found in settings location.");
      }

      const raw = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(raw);
      const settings = Settings.parse(json);
      return settings.data;
    },
    async setSettings(_, settings: SettingsData) {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return { good: true, message: file };
    },
    async runProgram(event, settings_data: SettingsData) { }
  },
  renderer: {
    async runnerUpdate(event, runner_status: RunnerStatus) { }
  }
});


/** ------------------------------------------------------------------------- */

export default IPC;