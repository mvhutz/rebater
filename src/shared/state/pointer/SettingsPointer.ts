import z from "zod/v4";
import { bad, good, Replier, Reply } from "../../reply";
import { Settings, SettingsData, SettingsSchema } from "../../settings";
import { FilePointer } from "./FilePointer";

/** ------------------------------------------------------------------------- */

export class SettingsPointer extends FilePointer<Settings> {
  protected onEmptyFile(): Reply<Settings> {
    return bad("No settings file found!");
  }

  public serialize(data: Settings): Reply<string> {
    return good(JSON.stringify(data.data));
  }

  public deserialize(data: string): Reply<Settings> {
    let json: unknown;
    try {
      json = JSON.parse(data);
    } catch (err) {
      return bad(`There is an issue with the settings configuration: ${String(err)}`);
    }

    const parsed = SettingsSchema.safeParse(json);
      
    if (!parsed.success) {
      return bad(z.prettifyError(parsed.error));
    } else {
      return good(new Settings(parsed.data));
    }
  }
  
  public getSchema(): Reply<SettingsData> {
    return Replier.of(this.getData()).map(d => d.data).end();
  }
}