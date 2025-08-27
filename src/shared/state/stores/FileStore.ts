import { FSWatcher } from "chokidar";
import path from "path";
import { bad, Reply } from "../../reply";
import { mkdir, readFile, rm, writeFile } from "fs/promises";

/** ------------------------------------------------------------------------- */

export abstract class FileStore<Data, Item> {
  public readonly directory: string;
  private readonly watcher: FSWatcher;
  public readonly items: Map<string, { item: Item, data: Reply<Data> }>;
  public readonly lazy: boolean;

  constructor(directory: string, lazy: boolean, watch: boolean) {
    this.directory = directory;
    this.items = new Map();
    this.watcher = new FSWatcher();
    this.lazy = lazy;

    this.watcher.on("add", file =>  this.handleAddFile(file));
    this.watcher.on("change", file => this.handleUpdateFile(file));
    this.watcher.on("unlink", file => this.handleDeleteFile(file));

    if (watch) {
      this.watch();
    }
  }

  protected abstract getFileFromItem(item: Item): Reply<string>;
  protected abstract getItemFromFile(file: string): Reply<Item>;

  public abstract serialize(data: Data): Reply<Buffer>;
  public abstract deserialize(data: Buffer): Reply<Data>;

  public async pull(item: Item): Promise<Reply<Data>> {
    const file = this.getFileFromItem(item);
    if (!file.ok) return file;

    const entry = this.items.get(file.data);
    if (entry == null) return bad(`No entry for ${file.data}`);
    
    const raw = await readFile(file.data);
    const data = this.deserialize(raw);

    this.items.set(file.data, { item, data });
    return data;
  }

  public async push(entry: { item: Item, data: Reply<Data> }): Promise<Reply<Data>> {
    const { item, data } = entry;
    if (!data.ok) return data;

    const file = this.getFileFromItem(item);
    if (!file.ok) return file;

    const serialized = this.serialize(data.data);
    if (!serialized.ok) return serialized;

    this.items.set(file.data, { item, data });

    await mkdir(path.dirname(file.data), { recursive: true });
    await writeFile(file.data, serialized.data);
    return data;
  }

  public async delete(entry: { item: Item, data: Reply<Data> }): Promise<void> {
    const file = this.getFileFromItem(entry.item);
    if (!file.ok) return;

    await rm(file.data);
  }

  private async handleAddFile(file: string) {
    console.log(`FILE '${file}' ADDED`);

    const entry = this.items.get(file);
    if (entry != null) {
      throw Error(`Adding file ${file}, with already exists in store!`);
    }

    const item = this.getItemFromFile(file);
    if (!item.ok) {
      throw Error(`Could not parse metadata from file ${file}!`);
    }
    
    this.items.set(file, { item: item.data, data: bad("Not loaded!") });
    if (!this.lazy) {
      await this.pull(item.data);
    }
  }

  private async handleDeleteFile(file: string) {
    console.log(`FILE '${file}' DELETED`);

    const item = this.items.get(file);
    if (item == null) return;

    this.items.delete(file);
  }

  private async handleUpdateFile(file: string) {
    console.log(`FILE '${file}' UPDATED`);

    const item = this.items.get(file);
    if (item == null) {
      throw Error(`Updating file ${file}, with does not exist in store!`);
    }

    if (this.lazy) {
      await this.pull(item.item);
    }
  }

  public watch() {
    this.watcher.add(this.directory);
  }

  public unwatch() {
    this.watcher.unwatch(this.directory);
  }
}