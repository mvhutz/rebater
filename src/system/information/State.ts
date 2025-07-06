import { BasicCounter, Counter } from "./Counter";
import { BasicReference, Reference } from "./Reference";
import { Handlers } from "./Handlers";
import Settings from "../../shared/settings";
import { TransformerData } from "../Transformer";
import fs from "fs/promises";
import assert from "assert";
import path from "path";
import { glob } from "fs/promises";

/** ------------------------------------------------------------------------- */

export abstract class State {
  public abstract setTime(time: Time): void;
  public abstract getTime(): Time;

  public abstract getCounter(name: string): Counter;
  public abstract getReference(name: string): Promise<Reference>;
  public abstract getSettings(): Settings;
  public abstract get handlers(): Handlers;

  public abstract loadSourceFilesQueries(...filepaths: string[]): Promise<void>;
  public abstract pullSourceFileGlob(filepath: string): Buffer[];

  public abstract appendDestinationFile(filepath: string, data: Buffer): void;
  public abstract saveDestinationFiles(): Promise<void>;
}

export class BasicState extends State {
  public static readonly INITIAL_COUNTER_VALUE = 0;

  private time: Time;

  private counters: Map<string, BasicCounter>;
  private references: Map<string, BasicReference>;

  private settings: Settings;
  public handlers: Handlers;

  private source_files: Map<string, Buffer>;
  private source_file_queries: Map<string, string[]>;
  private destination_files: Map<string, Buffer>;

  constructor(time: Time, settings: Settings, handlers: Handlers = {}) {
    super();

    this.time = time;
    this.settings = settings;
    this.handlers = handlers;
    this.counters = new Map();
    this.references = new Map();
    this.source_files = new Map();
    this.source_file_queries = new Map();
    this.destination_files = new Map();
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public setTime(time: Time): void {
    this.time = time;
  }

  public getTime(): Time {
    return this.time;
  }

  public getCounter(name: string): BasicCounter {
    const counter = this.counters.get(name);
    if (counter != null) return counter;

    const new_counter = new BasicCounter(BasicState.INITIAL_COUNTER_VALUE);
    this.counters.set(name, new_counter);
    return new_counter;
  }

  public async getReference(name: string): Promise<BasicReference> {
    const counter = this.references.get(name);
    if (counter != null) return counter;

    const filepath = this.getSettings().strategy.getReferencePath(name);
    const new_reference = await BasicReference.load(filepath);
    this.references.set(name, new_reference);
    return new_reference;
  }

  public async loadSourceFilesQueries(...queries: string[]) {
    for (const query of queries) {
      if (this.source_file_queries.has(query)) continue;

      const files = [];

      for await (const file of glob(query)) {
        if (this.source_files.has(file)) continue;

        const buffer = await fs.readFile(file);
        this.source_files.set(file, buffer);
        files.push(file);
      }

      this.source_file_queries.set(query, files);
    }
  }

  public pullSourceFileGlob(query: string): Buffer[] {
    const files = this.source_file_queries.get(query);
    assert.ok(files != null, `Source file query '${query}' not loaded!`);

    const buffers = [];
    for (const file of files) {
      const buffer = this.source_files.get(file);
      assert.ok(buffer != null, `Source file '${file}' not loaded!`);
      buffers.push(buffer);
    }

    return buffers;
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
