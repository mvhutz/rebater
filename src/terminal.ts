import dotenv from "dotenv";
import { Settings } from "./shared/settings";
import { Runner } from "./system/runner/Runner";
import { readFile, writeFile } from "fs/promises";
import { fromText } from "./system/xml";
import { Transformer } from "./system/transformer";
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
  // const settings_parse = Settings.from(DATA);
  // if (!settings_parse.ok) {
  //   throw Error(settings_parse.reason);
  // }

  // const runner = new Runner(settings_parse.data);
  // runner.asker.on("ask", question => {
  //   console.log(question);

  //   process.stdin.once("data", (data) => {
  //     runner.asker.answer(question, data.toString().trim());
  //   });
  // })

  // runner.on("status", status => {
  //   console.log(JSON.stringify(status));
  // })

  // await runner.run();

  const transformer = await Transformer.fromFile("__data__/transformers/[CA] American Olean.json");
  const xml = transformer.toXML();
  const serialized = xml.end({ pretty: true, spaceBeforeSlash: " " });
  await writeFile("./out.xml", serialized);
}

main();
