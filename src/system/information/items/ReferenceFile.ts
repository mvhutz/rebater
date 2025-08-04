import { AbstractFile } from "./AbstractFile";
import z from "zod/v4";
import Papa from 'papaparse';
import Fuse from 'fuse.js';


/** ------------------------------------------------------------------------- */

export const ReferenceSchema = z.array(z.record(z.string(), z.string()));
export type Reference = z.infer<typeof ReferenceSchema>;

export class ReferenceFile<Meta = unknown> extends AbstractFile<Reference, Meta> {
  public readonly name: string;

  public constructor(path: string, name: string, meta: Meta) {
    super(path, [], meta);
    this.name = name;
  }

  hash(): string {
    return this.name;
  }

  insert(datum: Record<string, string>[]): void {
    this.data.push(...datum);
  }

  serialize(): Buffer {
    return Buffer.from(Papa.unparse(this.data));
  }

  deserialize(raw: Buffer): Reference {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    });

    return ReferenceSchema.parse(data);
  }

  private match(ask: Record<string, string>, datum: Record<string, string>) {
    for (const [property, value] of Object.entries(ask)) {
      if (datum[property] !== "*" && datum[property] !== value) {
        return false;
      }
    }

    return true;
  }

  public ask(known: Record<string, string>, unknown: string): Maybe<string> {
    for (const datum of this.data) {
      if (this.match(known, datum)) {
        return datum[unknown];
      }
    }

    return null;
  }

  public suggest(property: string, matches: string, take: string): { key: string; value: string; group: string; }[] {
    const fuse = new Fuse(this.data, {
      keys: [property],
      threshold: 0.2
    });

    const results = fuse.search(matches);
    return results.map(r => ({
      key: r.item[property],
      value: r.item[take],
      group: r.item.group
    }));
  }
}