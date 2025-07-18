import { BasicCounter, Counter } from "./Counter";
import { BasicReference, Reference } from "./Reference";
import fs from "fs/promises";
import assert from "assert";
import path from "path";
import { glob } from "fs/promises";
import { SettingsInterface } from "../../shared/settings_interface";
import mutexify from 'mutexify/promise';

/** ------------------------------------------------------------------------- */

export abstract class State {
  public abstract getCounter(name: string): Counter;
  public abstract getReference(name: string): Promise<Reference>;
  public abstract getSettings(): SettingsInterface;

  public abstract loadSourceFilesQueries(...filepaths: string[]): Promise<void>;
  public abstract pullSourceFileGlob(filepath: string): FileData[];

  public abstract appendDestinationFile(filepath: string, data: Buffer): void;
  public abstract saveDestinationFiles(): Promise<void>;
  public abstract requestAsk(): Promise<() => void>;
  public abstract ask(question: string): Promise<Maybe<string>>;
}

export class BasicState extends State {
  public static readonly INITIAL_COUNTER_VALUE = 0;

  private counters: Map<string, BasicCounter>;
  private references: Map<string, BasicReference>;

  private settings_interface: SettingsInterface;

  private source_files: Map<string, Buffer>;
  private source_file_queries: Map<string, string[]>;
  private destination_files: Map<string, Buffer>;
  public ask: (question: string) => Promise<Maybe<string>>;
  private lock = mutexify();

  constructor(settings: SettingsInterface, onAsk: (question: string) => Promise<Maybe<string>>) {
    super();

    this.settings_interface = settings;
    this.counters = new Map();
    this.references = new Map();
    this.source_files = new Map();
    this.source_file_queries = new Map();
    this.destination_files = new Map();
    this.ask = onAsk;
  }

  public async requestAsk(): Promise<() => void> {
    return await this.lock();
  }

  public getSettings(): SettingsInterface {
    return this.settings_interface;
  }

  public getCounter(name: string): BasicCounter {
    const counter = this.counters.get(name);
    if (counter != null) return counter;

    const new_counter = new BasicCounter(BasicState.INITIAL_COUNTER_VALUE);
    this.counters.set(name, new_counter);
    return new_counter;
  }

  public async getReference(name: string): Promise<BasicReference> {
    const reference = this.references.get(name);
    if (reference != null) return reference;

    const filepath = this.getSettings().getReferencePath(name);
    const new_reference = await BasicReference.load(filepath);
    this.references.set(name, new_reference);
    return new_reference;
  }

  public async saveReferences(): Promise<void> {
    for (const [, reference] of this.references) {
      await reference.save();
    }
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

  public pullSourceFileGlob(query: string): FileData[] {
    const files = this.source_file_queries.get(query);
    assert.ok(files != null, `Source file query '${query}' not loaded!`);

    const buffers: FileData[] = [];
    for (const file of files) {
      const buffer = this.source_files.get(file);
      assert.ok(buffer != null, `Source file '${file}' not loaded!`);
      buffers.push({ raw: buffer, path: file });
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
