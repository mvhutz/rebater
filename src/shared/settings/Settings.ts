import { z } from "zod/v4";
import * as SettingsStrategy from "./strategy";

/** ------------------------------------------------------------------------- */

export const Schema = z.object({
  strategy: SettingsStrategy.Schema
});

export type Data = z.infer<typeof Schema>;
