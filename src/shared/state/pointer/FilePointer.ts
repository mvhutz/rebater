import { existsSync } from "fs";
import { bad, good, Reply } from "../../reply";
import { lstat, readFile, writeFile } from "fs/promises";
import { FSWatcher, watch as fsWatch } from "chokidar";
import path from "path";
import Lockfile from 'proper-lockfile';
import { EventEmitter } from "stream";

/** ------------------------------------------------------------------------- */

export abstract class FilePointer<Data> {
  public readonly file: string;
  public watcher: Maybe<FSWatcher>;
  protected data: Reply<Data>;
  public readonly emitter: EventEmitter<{ refresh: [Reply<Data>] }>;

  constructor(file: string, watch = true) {
    this.file = file;
    this.data = bad("Not loaded!");
    this.emitter = new EventEmitter();

    if (watch) {
      this.watch();
    }
  }

  public async runPrivileged<T>(fn: () => Promise<Reply<T>>): Promise<Reply<T>> {
    const release = await Lockfile.lock(path.dirname(this.file), {
      retries: { forever: true, randomize: true }
    });

    try {
      const out = await fn();
      await release();
      return out;
    } catch (err) {
      await release();
      return bad(`${err}`);
    }
  }

  public getData() {
    return this.data;
  }

  public abstract serialize(data: Data): Reply<string>;
  public abstract deserialize(data: string): Reply<Data>;

  public async update(fn: (data: Reply<Data>) => Promise<Reply<Data>>): Promise<Reply> {
    return await this.runPrivileged(async () => {
      const data = await this.pull();
      const updated = await fn(data);
      if (!updated.ok) return updated;

      await this.setDataUnsafe(updated.data);
      return good(undefined);
    })
  }

  public async setDataUnsafe(data: Data) {
    const serialized = this.serialize(data);
    if (!serialized.ok) return serialized;

    this.data = good(data);

    await writeFile(this.file, serialized.data);
    return good(undefined);
  }

  public async setData(data: Data): Promise<void> {
    await this.runPrivileged(() => this.setDataUnsafe(data));
  }

  private async fetch(file: string): Promise<Reply<Data>> {
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
    return this.deserialize(raw);
  }

  public async pull() {
    console.log("REFRESH", this.file);
    this.data = await this.fetch(this.file);
    this.emitter.emit("refresh", this.data);
    return this.data;
  }

  public async push() {
    if (!this.data.ok) return;
    await this.setData(this.data.data);
  }

  public watch() {
    this.data = bad("Not loaded!");
    this.watcher = fsWatch(path.dirname(this.file), {
      ignored: f => path.dirname(this.file) !== f && f !== this.file
    });

    this.watcher.on("add", () =>  this.pull());
    this.watcher.on("change", () => this.pull());
    this.watcher.on("unlink", () => this.pull());
  }

  public unwatch() {
    this.watcher?.close();
    this.watcher = null;
  }
}