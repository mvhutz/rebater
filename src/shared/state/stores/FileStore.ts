import { FSWatcher, watch as fsWatch } from "chokidar";
import path from "path";
import { bad, good, Reply } from "../../reply";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import Lockfile from 'proper-lockfile';

/** ------------------------------------------------------------------------- */

export abstract class FileStore<Data, Item> {
  public readonly directory: string;
  private watcher: Maybe<FSWatcher>;
  public readonly entries: Map<string, { item: Item, data: Reply<Data> }>;
  public readonly lazy: boolean;
  private ready: boolean;

  constructor(directory: string, lazy: boolean, watch = true) {
    this.directory = directory;
    this.entries = new Map();
    this.watcher = null;
    this.ready = false;
    this.lazy = lazy;

    if (watch) {
      this.watch();
    }
  }

  protected abstract getFileFromItem(item: Item): Reply<string>;
  protected abstract getItemFromFile(file: string): Reply<Item>;

  public abstract serialize(data: Data): Reply<Buffer>;
  public abstract deserialize(data: Buffer): Reply<Data>;

  public async runPrivileged<T>(fn: () => Promise<Reply<T>>): Promise<Reply<T>> {
    const release = await Lockfile.lock(path.dirname(this.directory), {
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

  public async pull(item: Item): Promise<Reply<Data>> {
    const file = this.getFileFromItem(item);
    if (!file.ok) return file;

    const entry = this.entries.get(file.data);
    if (entry == null) return bad(`No entry for ${file.data}`);
    
    const raw = await readFile(file.data);
    const data = this.deserialize(raw);

    this.entries.set(file.data, { item, data });
    return data;
  }

  public async pullAll(): Promise<void> {
    await Promise.all(this.entries.values().map(e => this.pull(e.item)));
  }

  public getEntries() {
    return this.entries.values();
  }

  public getValid(fn: (entry: { item: Item; data: Reply<Data> }) => boolean = () => true) {
    return this.entries.values()
      .filter(fn)
      .map(e => e.data)
      .filter(e => e.ok)
      .map(e => e.data)
      .toArray();
  }

  private async pushUnsafe(entry: { item: Item, data: Reply<Data> }): Promise<Reply<{ item: Item, data: Reply<Data> }>> {
    const { item, data } = entry;
    if (!data.ok) return data;

    const file = this.getFileFromItem(item);
    if (!file.ok) return file;

    const serialized = this.serialize(data.data);
    if (!serialized.ok) return serialized;

    this.entries.set(file.data, entry);

    await mkdir(path.dirname(file.data), { recursive: true });
    await writeFile(file.data, serialized.data);
    return good(entry);
  }

  public async push(entry: { item: Item, data: Reply<Data> }): Promise<Reply<{ item: Item, data: Reply<Data> }>> {
    return await this.runPrivileged(() => this.pushUnsafe(entry));
  }

  public mark(entry: { item: Item, data: Reply<Data> }): Reply<Data> {
    const { item, data } = entry;
    if (!data.ok) return data;

    const file = this.getFileFromItem(item);
    if (!file.ok) return file;

    const serialized = this.serialize(data.data);
    if (!serialized.ok) return serialized;

    this.entries.set(file.data, { item, data });
    return data;
  }

  public async pushAll() {
    return await this.runPrivileged(async () => {
      await Promise.all(this.entries.values().map(e => this.pushUnsafe(e)));
      return good(undefined);
    });
  }

  private async deleteUnsafe(entry: { item: Item, data: Reply<Data> }): Promise<Reply> {
    const file = this.getFileFromItem(entry.item);
    if (!file.ok) return file;

    this.entries.delete(file.data);

    await rm(file.data);
    return good(undefined);
  }

  public async delete(entry: { item: Item, data: Reply<Data> }): Promise<Reply> {
    return await this.runPrivileged(() => this.deleteUnsafe(entry));
  }

  private async handleAddFile(file: string) {
    if (this.ready) {
      console.log(`ADDED '${path.relative(this.directory, file)}'`);
    }

    const entry = this.entries.get(file);
    if (entry != null) {
      console.log(`DUPLICATE FILE "${file}"`);
      return;
    }

    const item = this.getItemFromFile(file);
    if (!item.ok) {
      console.log(`UNVALID METADATA "${file}": ${item.reason}`);
      return;
    }
    
    this.entries.set(file, { item: item.data, data: bad("Not loaded!") });
    if (!this.lazy) {
      await this.pull(item.data);
    }
  }

  private async handleDeleteFile(file: string) {
    if (this.ready) {
      console.log(`DELETED '${path.relative(this.directory, file)}'`);
    }

    const item = this.entries.get(file);
    if (item == null) {
      console.log(`MISSING DELETE ITEM "${file}"`);
      return;
    }

    this.entries.delete(file);
  }

  private async handleUpdateFile(file: string) {
    if (this.ready) {
      console.log(`UPDATED '${path.relative(this.directory, file)}'`);
    }

    const item = this.entries.get(file);
    if (item == null) {
      console.log(`MISSING UPDATE ITEM "${file}"`);
      return;
    }

    if (this.lazy) {
      await this.pull(item.item);
    }
  }

  public wipe() {
    this.entries.clear();
  }

  public watch() {
    this.wipe();
    this.ready = false;

    this.watcher = fsWatch(path.dirname(this.directory), {
      ignored: f => path.dirname(this.directory) !== f && !f.startsWith(this.directory)
    });

    this.watcher.on("add", file =>  this.handleAddFile(file));
    this.watcher.on("change", file => this.handleUpdateFile(file));
    this.watcher.on("unlink", file => this.handleDeleteFile(file));
    this.watcher.on("ready", () => { this.ready = true; });
  }

  public unwatch() {
    this.watcher?.close();
    this.watcher = null;
  }
}