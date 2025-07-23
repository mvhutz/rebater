import { SettingsSchema } from "./shared/settings";
import z from "zod/v4";
import { makeSettingsInterface } from "./shared/settings_interface";
import { Runner } from "./system/Runner";

import dotenv from "dotenv";
dotenv.config();

const DATA = {
  "context": {
    "year": 2024,
    "quarter": 4
  },
  "transformers": {
    "tags": {
      "include": []
    },
    "names": {
      "include": []
    }
  },
  "advanced": {
    "target": {
      "type": "basic",
      "directory": process.env.PROFILE_SETTINGS
    },
    "doTesting": true
  }
};

/** ------------------------------------------------------------------------- */

async function main() {
  const { success, data: settings, error } = SettingsSchema.safeParse(DATA);
  if (!success) {
    throw Error(z.prettifyError(error));
  }

  const settings_interface = makeSettingsInterface(settings);
  if (!settings_interface.ok) {
    throw Error(settings_interface.reason);
  }

  const runner = new Runner();

  console.profile();
  await runner.run(settings_interface.data);
  console.profileEnd();
}

main();
