import { BasicCounter } from "./Counter";
import fs from "fs/promises";
import assert from "assert";
import path from "path";
import mutexify from 'mutexify/promise';
import { ReferenceStore } from "./reference/ReferenceStore";
import { Settings } from "../../shared/settings";
import { SourceStore } from "./source/SourceStore";

/** ------------------------------------------------------------------------- */

export class State {
  public static readonly INITIAL_COUNTER_VALUE = 0;

  private counters: Map<string, BasicCounter>;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;

  private destination_files: Map<string, Buffer>;
  public ask: (question: string) => Promise<Maybe<string>>;
  private lock = mutexify();

  constructor(settings: Settings, onAsk: (question: string) => Promise<Maybe<string>>) {
    this.settings = settings;
    this.counters = new Map();
    this.references = new ReferenceStore(settings.getReferencePath());
    this.sources = new SourceStore(settings.getAllSourcePath());
    this.destination_files = new Map();
    this.ask = onAsk;
  }

  public async requestAsk(): Promise<() => void> {
    return await this.lock();
  }

  public getCounter(name: string): BasicCounter {
    const counter = this.counters.get(name);
    if (counter != null) return counter;

    const new_counter = new BasicCounter(State.INITIAL_COUNTER_VALUE);
    this.counters.set(name, new_counter);
    return new_counter;
  }

  public appendDestinationFile(filepath: string, data: Buffer) {
    const buffer = this.destination_files.get(filepath);

    if (buffer == null) {
      this.destination_files.set(filepath, data);
    } else {
      this.destination_files.set(filepath, Buffer.concat([buffer, data]));
    }
  }

  public async saveDestinationFile(filepath: string): Promise<void> {
    const buffer = this.destination_files.get(filepath);
    assert.ok(buffer != null, `Destination '${filepath}' not loaded!`);

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buffer);
  }

  public async saveDestinationFiles(): Promise<void> {
    Promise.all(this.destination_files.keys().map(f => {
      this.saveDestinationFile(f);
    }));
  }
}
