import { bad, good } from "../../reply";
import { Transformer } from "../../../system/transformer";
import { getSettingsInterface } from "./getSettings";

/** ------------------------------------------------------------------------- */

/**
 * Fetches all valid transformers.
 * @returns The transformers.
 */
export async function getTransformers() {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  try {
    const transformers = await Transformer.pullAll(isettings);
    return good(transformers.map(t => t.getInfo()));
  } catch (err) {
    return bad(`Error parsing transformers: ${err}`);
  }
}