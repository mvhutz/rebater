import { good } from "../../reply";
import { Transformer } from "../../../system/transformer";
import { makeSettingsInterface } from "../../settings_interface";
import { getSettings } from "./getSettings";

/** ------------------------------------------------------------------------- */

export async function getTransformers() {
  const settings_response = await getSettings();
  if (!settings_response.ok) return settings_response;
  const { data: settings } = settings_response;

  const settings_interface_respose = makeSettingsInterface(settings);
  if (!settings_interface_respose.ok) return settings_interface_respose;

  const { data: settings_interface } = settings_interface_respose;

  const transformers = await Transformer.pullAll(settings_interface);
  return good(transformers.map(t => t.data));
}