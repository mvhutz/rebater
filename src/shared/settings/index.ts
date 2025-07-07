import { z } from "zod/v4";
import SettingsStrategy from "./strategy/base";
import BasicSettingsStrategy from "./strategy/basic";

/** ------------------------------------------------------------------------- */

export type SettingsData = z.input<typeof Settings.Schema>;

export default class Settings {
  public static readonly Schema = z.object({
    strategy: z.discriminatedUnion("type", [
      BasicSettingsStrategy.Schema
    ])
  });

  public readonly data: SettingsData;
  public readonly strategy: SettingsStrategy;

  constructor(data: SettingsData) {
    this.data = data;

    switch (data.strategy.type) {
      case "basic":
        this.strategy = new BasicSettingsStrategy(this.data.strategy);
    }
  }

  public static parse(from: any) {
    const parsed = Settings.Schema.parse(from);
    return new Settings(parsed);
  }
}
