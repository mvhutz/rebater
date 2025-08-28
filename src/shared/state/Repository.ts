import { FSWatcher, watch } from "chokidar";
import { Settings, SettingsData, SettingsSchema } from "../settings";
import { existsSync } from "fs";
import { bad, good, Replier, Reply } from "../reply";
import { lstat, readFile, writeFile } from "fs/promises";
import z from "zod/v4";
import { State } from ".";

/** ------------------------------------------------------------------------- */

export class Repository {
  public file: string;
  public watcher: Maybe<FSWatcher>;
  private settings: Reply<Settings>;
  private state: Reply<State>;

  constructor(file: string, watch = true) {
    this.file = file;
    this.settings = bad("Not loaded!");
    this.state = bad("Not loaded!");

    if (watch) {
      this.watch();
    }
  }

  public getSettings() {
    return this.settings;
  }

  public getState() {
    return this.state;
  }

  public getSettingsData(): Reply<SettingsData> {
    return Replier.of(this.settings)
      .map(s => s.data)
      .end();
  }

  public async setSettingsData(data: SettingsData): Promise<void> {
    await writeFile(this.file, JSON.stringify(data));
  }

  private static async pullSettings(file: string): Promise<Reply<Settings>> {
    // Return the default settings, if the file does not exist.
    if (!existsSync(file)) {
      return bad("No file!");
    }
  
    // Should only be a file.
    const stat = await lstat(file);
    if (!stat.isFile()) {
      return bad("File not found in settings location.");
    }
  
    // Parse data.
    const raw = await readFile(file, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = SettingsSchema.safeParse(json);
  
    if (!parsed.success) {
      return bad(z.prettifyError(parsed.error));
    } else {
      return good(new Settings(parsed.data));
    }
  }

  public async refresh() {
    this.settings = await Repository.pullSettings(this.file);
    if (this.settings.ok) {
      if (this.state.ok && this.state.data.directory === this.settings.data.data.directory) return;
      console.log("NEW STATE");
      this.state = good(new State(this.settings.data.data.directory));
    } else {
      console.log("BAD STATE");
      this.state = this.settings;
    }
  }

  public unwatch() {
    this.watcher?.close();
    this.watcher = null;
  }

  public watch() {
    this.watcher = watch(this.file, {
      ignoreInitial: false
    });

    this.watcher.on("add", () => this.refresh());
    this.watcher.on("change", () => this.refresh());
    this.watcher.on("unlink", () => this.refresh());
  }
}