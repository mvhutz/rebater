import { bad, good, Reply } from "../../reply";
import { AdvancedTransformer, TransformerFileInfo } from "../../../system/transformer/AdvancedTransformer";
import { getSettingsInterface } from "./getSettings";

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
    const available_transformers = await AdvancedTransformer.pullAllAvailable(isettings);
    return good(available_transformers);
  } catch (err) {
    return bad(`Error parsing transformers: ${err}`);
  }
}