import { app, dialog } from "electron";
import { createInterprocess } from "interprocess";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from 'node:fs/promises';
import * as Settings from './settings';

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
    async getSettings(): Promise<Settings.Data | undefined> {
      const file = path.join(app.getPath("userData"), "settings.json");
      if (!existsSync(file)) {
        return undefined;
      }

      const stat = await fs.lstat(file);
      if (!stat.isFile()) {
        throw Error("File not found in settings location.");
      }

      const raw = await fs.readFile(file, 'utf-8');
      const data = Settings.Schema.parse(JSON.parse(raw));
      return data;
    },
    async setSettings(_, settings: Settings.Data) {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return { good: true, message: file };
    },
  },
});

// async function main() {
//   const time = { quarter: 4, year: 2024 } satisfies Time;
//   const settings = new BasicSettings("./data");
//   const state = new BasicState(time, settings);
//   const runner = new CLIRunner();

//   runner.run(state);
// }


/** ------------------------------------------------------------------------- */

export default IPC;