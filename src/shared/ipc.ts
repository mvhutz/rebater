import { app, dialog, shell } from "electron";
import { createInterprocess } from "interprocess";
import path from "path";
import { existsSync } from "fs";
import fs from 'fs/promises';
import { bad, good, Reply } from "./reply";
import { Settings, SettingsSchema } from "./settings";
import z from "zod/v4";
import { SystemStatus } from "./system_status";

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
    async getSettings(): Promise<Reply<Maybe<Settings>>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      if (!existsSync(file)) {
        return good(undefined);
      }

      const stat = await fs.lstat(file);
      if (!stat.isFile()) {
        return bad("File not found in settings location.");
      }

      const raw = await fs.readFile(file, 'utf-8');
      const json = JSON.parse(raw);
      const parsed = SettingsSchema.safeParse(json);
      if (!parsed.success) {
        return bad(z.prettifyError(parsed.error));
      } else {
        return good(parsed.data);
      }
    },
    async setSettings(_, settings: Settings): Promise<Reply<string>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return good(file);
    },
    async runProgram(_, settings?: Settings): Promise<Reply<undefined>> {
      void [settings];

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