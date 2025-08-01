import { good } from "../../reply";
import { Transformer } from "../../../system/transformer";
import { getSettingsInterface } from "./getSettings";

/** ------------------------------------------------------------------------- */

export async function getTransformers() {
  const settings_reply = await getSettingsInterface(); 
  if (!settings_reply.ok) return settings_reply;
  const { data: isettings } = settings_reply;

  const transformers = await Transformer.pullAll(isettings);
  return good(transformers.map(t => t.getInfo()));
}