import { writeFile } from "fs/promises";
import { good } from "../../reply";
import { getSettingsInterface } from "./getSettings";
import { randomBytes } from "crypto";

/** ------------------------------------------------------------------------- */

interface CreateTransformerOptions {
  /** The configuration itself, in JSON. */
  configuration: string;

  name: string;
}

export async function createTransformer(_: unknown, options: CreateTransformerOptions) {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const filename = options.name.toLowerCase().replaceAll(" ", "_") + "_" + randomBytes(8).toString("base64url");
  const filepath = isettings.getTransformerPath(filename);
  await writeFile(filepath, options.configuration);
  return good(filepath);
}