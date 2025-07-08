import { app, dialog, shell } from "electron";
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
    async openDir(_, filepath: string) {
      shell.showItemInFolder(filepath);
    },
    async getSettings(): Promise<APIResponse<SettingsData | undefined>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      if (!existsSync(file)) {
        return { good: true, data: undefined };
      }

      const stat = await fs.lstat(file);
      if (!stat.isFile()) {
        return { good: false, reason: "File not found in settings location." };
      }

      const raw = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(raw);
      const settings = Settings.parse(json);
      return { good: true, data: settings.data };
    },
    async setSettings(_, settings: SettingsData): Promise<APIResponse<string>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return { good: true, data: file };
    },
    async runProgram(event, settings_data?: SettingsData): Promise<APIResponse<undefined>> {
      return { good: true, data: undefined };
    }
  },
  renderer: {
    async runnerUpdate(event, runner_status: RunnerStatus) { }
  }
});


/** ------------------------------------------------------------------------- */

export default IPC;