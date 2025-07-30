import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import z from "zod/v4";
import Papa from 'papaparse';
import { getSubFiles } from "../util";

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
    return this.path;
  }

  async save(): Promise<void> {
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, Papa.unparse(this.data));
  }

  insert(datum: ReferenceData): void {
    this.data.push(...datum);
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
      const reference = new Reference(filepath, path.parse(name).name);
      this.add(reference);
    }
  }

  public ask(table: string, property: string, matches: string, take: string, group: string): Maybe<string> {
    for (const [, reference] of this.items) {
      if (reference.name !== table) continue;
      const answer = reference.ask(property, matches, take, group);
      if (answer != null) return answer;
    }
  }

  public answer(table: string, property: string, matches: string, take: string, group: string, answer: string): void {
    let reference = this.items.values().find(r => r.name === table);
    if (reference == null) {
      reference = new Reference(path.join(this.directory, `${table}.csv`), table);
      this.add(reference);
    }

    reference.insert([{
      [property]: matches,
      [take]: answer,
      group: group,
    }]);
  }
}