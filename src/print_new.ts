import dotenv from "dotenv";
import { Settings } from "./shared/settings";
import { mkdir, writeFile } from "fs/promises";
import { Transformer } from "./system/transformer";
import path from "path";
dotenv.config({ quiet: true });

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

  const new_transformers = path.join(settings_parse.data.directory, "new_transformers");

  const transformers = await Transformer.pullAll(settings_parse.data);
  await mkdir(new_transformers, { recursive: true });
  
  for (const transformer of transformers) {
    const transformer_path = path.join(new_transformers, `${transformer.name}.xml`);
    await writeFile(transformer_path, transformer.toXML());
  }
}

main();
