import { Err, None, Ok, Option, Result, Some } from 'ts-results';
import { RebaterResult, Thrown } from './error';
import { readdir, readFile, rm, writeFile } from 'fs/promises';
import Lockfile from 'proper-lockfile';
import path from 'path';

/** ------------------------------------------------------------------------- */

export class Locker {
  public readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  public async run<T>(fn: () => Promise<RebaterResult<T>>): Promise<RebaterResult<T>> {
    let release: () => Promise<void>;
    try {
      release = await Lockfile.lock(path.dirname(this.path), {
        retries: { forever: true, randomize: true }
      });
    } catch (err) {
      return Err(Thrown("LOCKER", "OBTAIN_LOCK", { file: this.path, cause: err }));
    }

    const out = await fn();

    try {
      await release();
      return out;
    } catch (err) {
      await release();
      return Err(Thrown("LOCKER", "RELEASE_LOCK", { file: this.path, cause: err }));
    }
  }
}

/** ------------------------------------------------------------------------- */

export interface FileDetailsParser<T> {
  fromFile(this: void, file: string): RebaterResult<T>;
  toFile(this: void, details: T): string;
}

export interface FileDataParser<T> {
  serialize(this: void, data: T): RebaterResult<Buffer>;
  deserialize(this: void, data: Buffer): RebaterResult<T>;
}

export interface FileItem<Details, Data> {
  readonly details: Details;
  readonly data: RebaterResult<Data>;
}

/** ------------------------------------------------------------------------- */

export abstract class FileStore<Details, Data> {
  private readonly parser: FileDetailsParser<Details>;
  private readonly serializer: FileDataParser<Data>;
  private readonly locker: Locker;
  public readonly directory: string;
  public readonly name: string;

  constructor(name: string, directory: string, parser: FileDetailsParser<Details>, serializer: FileDataParser<Data>) {
    this.parser = parser;
    this.serializer = serializer;
    this.directory = directory;
    this.locker = new Locker(this.directory);
    this.name = name;
  }

  public async pull(details: Details): Promise<FileItem<Details, Data>> {
    const name = this.parser.toFile(details);

    return {
      details,
      data: (await Result.wrapAsync(() => readFile(name)))
        .mapErr(err => Thrown("FILE_STORE", "READ_FILE", { store: this.name, file: name, cause: err }))
        .andThen(this.serializer.deserialize)
    };
  }

  private async pushUnsafe(file: FileItem<Details, Data>): Promise<RebaterResult> {
    const name = this.parser.toFile(file.details);
    const buffer = file.data
      .andThen(d => this.serializer.serialize(d));

    if (buffer.err) return buffer;

    return (await Result.wrapAsync(() => writeFile(name, buffer.safeUnwrap())))
      .mapErr(err => Thrown("FILE_STORE", "SAVE_FILE", { store: this.name, file: name, cause: err }));
  }

  public async push(file: FileItem<Details, Data>): Promise<RebaterResult> {
    return this.locker.run(() => this.pushUnsafe(file));
  }

  public async pushMany(files: IteratorObject<FileItem<Details, Data>>): Promise<RebaterResult> {
    return this.locker.run(async () => {
      return Result.all(...await Promise.all(files.map(f => this.pushUnsafe(f))))
        .map(() => undefined);
    });
  }

  private async deleteUnsafe(details: Details): Promise<RebaterResult> {
    const name = this.parser.toFile(details);

    return (await Result.wrapAsync(() => rm(name)))
      .mapErr(err => Thrown("FILE_STORE", "REMOVE_FILE", { store: this.name, file: name, cause: err }));
  }

  public async delete(details: Details): Promise<RebaterResult> {
    return this.locker.run(() => this.deleteUnsafe(details));
  }

  public async getDetails(): Promise<RebaterResult<ArrayIterator<Details>>> {
    return (await Result.wrapAsync(() => readdir(this.directory, { withFileTypes: true, recursive: true })))
      .mapErr(err => Thrown("FILE_STORE", "READ_DIRECTORY", { store: this.name, directory: this.directory, cause: err }))
      .map(entries => entries.values()
        .filter(e => e.isFile())
        .map(e => this.parser.fromFile(e.name))
        .filter(d => d.ok)
        .map(d => d.safeUnwrap()));
  }

  public async getFiles(): Promise<RebaterResult<FileCollection<Details, Data>>> {
    const details = await this.getDetails();
    if (details.err) return details;

    const files = await Promise.all(details.safeUnwrap().map(d => this.pull(d)));
    return FileCollection.fromArray(files.values(), { name: this.name, parser: this.parser });
  }

  public async sync(collection: FileCollection<Details, Data>): Promise<RebaterResult> {
    return this.pushMany(collection.getItems());
  }
}

/** ------------------------------------------------------------------------- */

interface FileCollectionOptions<Details> {
  name: string;
  parser: FileDetailsParser<Details>;
}

export class FileCollection<Details, Data> {
  private readonly items = new Map<string, FileItem<Details, Data>>();
  private readonly parser: FileDetailsParser<Details>;
  public readonly name: string;

  constructor(options: FileCollectionOptions<Details>) {
    this.parser = options.parser;
    this.name = options.name;
  }

  public static fromArray<Details, Data>(items: ArrayIterator<FileItem<Details, Data>>, options: FileCollectionOptions<Details>): RebaterResult<FileCollection<Details, Data>> {
    const collection = new FileCollection<Details, Data>(options);

    return Result.all(...items.map(i => collection.add(i)))
      .map(() => collection);
  }

  public getItems() {
    return this.items.values();
  }

  public getFromHash(hash: string): Option<FileItem<Details, Data>> {
    const item = this.items.get(hash);
    if (item == null) {
      return None;
    } else {
      return Some(item);
    }
  }

  public get(details: Details): Option<FileItem<Details, Data>> {
    return this.getFromHash(this.parser.toFile(details));
  }

  public forceGet(details: Details): RebaterResult<FileItem<Details, Data>> {
    const file = this.parser.toFile(details);

    return this.get(details)
      .toResult(Thrown("FILE_COLLECTION", "FILE_NOT_FOUND", { collection: this.name, file }));
  }

  public set(item: FileItem<Details, Data>): RebaterResult {
    this.items.set(this.parser.toFile(item.details), item);
    return Ok(undefined);
  }

  public add(item: FileItem<Details, Data>): RebaterResult {
    if (this.get(item.details).some) {
      const file = this.parser.toFile(item.details);
      return Err(Thrown("FILE_COLLECTION", "FILE_ALREADY_EXISTS", { collection: this.name, file }))
    }

    return this.set(item);
  }
}