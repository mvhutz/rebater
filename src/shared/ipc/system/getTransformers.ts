import { bad, good, Reply } from "../../reply";
import { getSettingsInterface } from "./getSettings";
import { BaseTransformer, TransformerFileInfo } from "../../../system/transformer/BaseTransformers";

/** ------------------------------------------------------------------------- */

/**
 * Fetches all valid transformers.
 * @returns The transformers.
 */
export async function getTransformers(): Promise<Reply<TransformerFileInfo[]>> {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  try {
    const available_transformers = await BaseTransformer.pullAllAvailable(isettings);
    return good(available_transformers);
  } catch (err) {
    return bad(`Error parsing transformers: ${err}`);
  }
}