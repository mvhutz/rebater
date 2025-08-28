import { State } from ".";
import { bad, good, Reply } from "../reply";
import { SettingsPointer } from "./pointer/SettingsPointer";

/** ------------------------------------------------------------------------- */

export class Repository {
  public readonly file: string;
  public readonly settings: SettingsPointer;
  private state: Reply<State>;

  constructor(file: string) {
    this.file = file;
    this.settings = new SettingsPointer(file, true);
    this.state = bad("Not loaded!");

    this.settings.emitter.on("refresh", new_settings => {
      if (!new_settings.ok) {
        this.state = new_settings;
      } else if (!this.state.ok || (this.state.data.directory !== new_settings.data.data.directory)) {
        this.state = good(new State(new_settings.data.data.directory));
      }
    });
  }

  public getState(): Readonly<Reply<State>> {
    return this.state;
  }
}