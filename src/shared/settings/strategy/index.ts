import { z } from "zod/v4";
import * as BasicSettingsStrategy from './basic';

/** ------------------------------------------------------------------------- */

export const Schema = z.discriminatedUnion("type", [
  BasicSettingsStrategy.Schema
]);

export type Data = z.infer<typeof Schema>;

export const Operations = {

};
