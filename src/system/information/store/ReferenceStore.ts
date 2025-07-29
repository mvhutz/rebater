import { readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import z from "zod/v4";
import Papa from 'papaparse';
import { getSubFiles } from "../../util";

/** ------------------------------------------------------------------------- */

const ReferenceSchema = z.array(z.record(z.string(), z.string()));
type ReferenceData = z.infer<typeof ReferenceSchema>;

export class Reference extends AbstractItem<ReferenceData> {
  public readonly path: string;
  public readonly name: string;

  public constructor(filepath: string, name: string) {
    super([]);

    this.path = filepath;
    this.name = name;
  }

  hash(): string {
    return this.name;
  }

  async save(): Promise<void> {
    await writeFile(this.path, Papa.unparse(this.data));
  }

  push(r: ReferenceData[number]) {
    this.data.push(r);
  }

  append(o: Reference): void {
    this.data.concat(o.data);
  }

  protected async fetch(): Promise<ReferenceData> {
    const raw = await readFile(this.path, 'utf-8');
    const { data: unclean } = Papa.parse(raw, { header: true });
    return ReferenceSchema.parse(unclean);
  }

  public ask(property: string, matches: string, take: string, group: string): Maybe<string> {
    const record = this.data.find(record => record[property] === matches && record.group === group);
    if (record == null) return undefined;
    return record[take];
  }
}

/** ------------------------------------------------------------------------- */

export class ReferenceStore extends AbstractStore<Reference, ReferenceData> {
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather(): Promise<void> {
    for (const [filepath, name] of await getSubFiles(this.directory)) {
      console.log(filepath, path.parse(name).name);
      const reference = new Reference(filepath, path.parse(name).name);
      this.add(reference);
    }
  }

  protected generate(hash: string): Reference {
    return new Reference(path.join(this.directory, `${hash}.csv`), hash);
  }
}