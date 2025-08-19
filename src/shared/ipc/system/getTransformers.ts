import { bad, good, Reply } from "../../reply";
import { AdvancedTransformer, TransformerInfo } from "../../../system/transformer/AdvancedTransformer";
import { getSettingsInterface } from "./getSettings";

/** ------------------------------------------------------------------------- */

/**
 * Fetches all valid transformers.
 * @returns The transformers.
 */
export async function getTransformers(): Promise<Reply<Reply<TransformerInfo>[]>> {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  try {
    const available_transformers = await AdvancedTransformer.pullAllAvailable(isettings);
    const transformer_info = available_transformers.map(t => t.ok ? good(t.data.getInfo()) : t)
    return good(transformer_info);
  } catch (err) {
    return bad(`Error parsing transformers: ${err}`);
  }
}