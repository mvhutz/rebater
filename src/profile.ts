import { Runner } from "./system/Runner";

import dotenv from "dotenv";
import { Settings } from "./shared/settings";
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
  const settings_parse = Settings.from(DATA);
  if (!settings_parse.ok) {
    throw Error(settings_parse.reason);
  }

  const runner = new Runner();

  console.profile();
  await runner.run(settings_parse.data);
  console.profileEnd();
}

main();
