import { app, dialog, shell } from "electron";
import { createInterprocess } from "interprocess";
import path from "path";
import { existsSync } from "fs";
import fs from 'fs/promises';
import { bad, good, Reply } from "./reply";
import { DEFAULT_SETTINGS, Settings, SettingsSchema } from "./settings";
import z from "zod/v4";
import { SystemStatus } from "./system_status";
import { Transformer, TransformerData } from "../system/Transformer";
import { makeSettingsInterface } from "./settings_interface";

/** ------------------------------------------------------------------------- */

async function getSettings(): Promise<Reply<Settings>> {
  const file = path.join(app.getPath("userData"), "settings.json");
  if (!existsSync(file)) {
    return good(DEFAULT_SETTINGS);
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
}

async function getTransformers(): Promise<Reply<TransformerData[]>> {
  const settings_response = await getSettings();
  if (!settings_response.ok) return settings_response;
  const { data: settings } = settings_response;

  const settings_interface_respose = makeSettingsInterface(settings);
  if (!settings_interface_respose.ok) return settings_interface_respose;

  const { data: settings_interface } = settings_interface_respose;

  const transformers = await Transformer.pullAll(settings_interface);
  return good(transformers.map(t => t.data));
}

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
    async setSettings(_, settings: Settings): Promise<Reply<string>> {
      const file = path.join(app.getPath("userData"), "settings.json");
      await fs.writeFile(file, JSON.stringify(settings));
      return good(file);
    },
    async runProgram(_, settings?: Settings): Promise<Reply> {
      void [settings];

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