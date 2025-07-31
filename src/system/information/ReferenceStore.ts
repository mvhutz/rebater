import path from "path";
import { AbstractStore } from "./AbstractStore";
import z from "zod/v4";
import Papa from 'papaparse';
import { getSubFiles } from "../util";
import { AbstractFile } from "./RebateFile";

/** ------------------------------------------------------------------------- */

const ReferenceSchema = z.array(z.record(z.string(), z.string()));
type ReferenceData = z.infer<typeof ReferenceSchema>;

export class Reference extends AbstractFile<ReferenceData, { name: string }> {
  constructor(path: string, meta: { name: string }) {
    super(path, [], meta);
  }

  serialize(): Buffer {
    return Buffer.from(Papa.unparse(this.data));
  }

  deserialize(raw: Buffer): ReferenceData {
    const { data: unclean } = Papa.parse(raw.toString("utf-8"), { header: true });
    return ReferenceSchema.parse(unclean);
  }

  insert(datum: ReferenceData): void {
    this.data.push(...datum);
  }

  public ask(property: string, matches: string, take: string, group: string): Maybe<string> {
    const record = this.data.find(record => record[property] === matches && record.group === group);
    if (record == null) return undefined;
    return record[take];
  }
}

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

export class ReferenceStore extends AbstractStore<Reference, ReferenceData, Meta> {
  public async gather(): Promise<void> {
    for (const [filepath, name] of await getSubFiles(this.meta.directory)) {
      const reference = new Reference(filepath, { name: path.parse(name).name });
      this.add(reference);
    }
  }

  public ask(table: string, property: string, matches: string, take: string, group: string): Maybe<string> {
    for (const [, reference] of this.items) {
      if (reference.meta.name !== table) continue;
      const answer = reference.ask(property, matches, take, group);
      if (answer != null) return answer;
    }
  }

  public answer(table: string, property: string, matches: string, take: string, group: string, answer: string): void {
    let reference = this.items.values().find(r => r.meta.name === table);
    if (reference == null) {
      reference = new Reference(path.join(this.meta.directory, `${table}.csv`), { name: table });
      this.add(reference);
    }

    reference.insert([{
      [property]: matches,
      [take]: answer,
      group: group,
    }]);
  }
}