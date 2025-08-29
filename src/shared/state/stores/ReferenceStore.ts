import z from "zod/v4";
import Papa from 'papaparse';
import Fuse from 'fuse.js';
import { bad, good, Reply } from "../../reply";
import { FileStore } from "./FileStore";
import path from "path";
import { slugify } from "../../../system/util";


/** ------------------------------------------------------------------------- */

export const ReferenceSchema = z.array(z.record(z.string(), z.string()));
export type ReferenceData = z.infer<typeof ReferenceSchema>;

/**
 * A optimized view of a ReferenceFile, based on a primary key.
 */
export class ReferenceView {
  private readonly data: Map<string, Set<ReferenceData[number]>>;
  public readonly key: string;

  constructor(reference: ReferenceData, key: string) {
    this.data = new Map();
    this.key = key;

    for (const object of reference) {
      const set = this.data.get(slugify(object[key]));
      if (set == null) {
        this.data.set(slugify(object[key]), new Set([object]));
      } else {
        set.add(object);
      }
    }
  }

  /**
   * Determine is a datum matches a set of requirements.
   * @param ask The set of requirements. For the datum to match, each property
   * in `ask` must have a matching value in the `datum`, or, they value is "*"
   * @param datum The datum to match against.
   * @returns True, if it matches.
   */
  private match(ask: Record<string, string>, datum: Record<string, string>) {
    for (const property in ask) {
      if (datum[property] !== "*" && slugify(datum[property]) !== slugify(ask[property])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find a record that matches some known properties, and return its unknown field.
   * @param known The known properties which are matches against.
   * @param unknown The unknown property.
   * @returns The unknown property's value.
   */
  public ask(known: Record<string, string>, unknown: string): Maybe<string> {
    const bucket = this.data.get(slugify(known[this.key]));
    if (bucket == null) return null;

    for (const datum of bucket) {
      if (this.match(known, datum)) {
        return datum[unknown];
      }
    }

    return null;
  }
}

/**
 * An Abstract file, which specifically contains Reference data.
 * 
 * References are used by transformers to lookup tabular data, during
 * processing.
 */
export class Reference {
  public readonly data: ReferenceData;

  public constructor(data: ReferenceData) {
    this.data = data;
  }

  public insert(...records: ReferenceData) {
    return new Reference(this.data.concat(records));
  }

  /**
   * Determine is a datum matches a set of requirements.
   * @param ask The set of requirements. For the datum to match, each property
   * in `ask` must have a matching value in the `datum`, or, they value is "*"
   * @param datum The datum to match against.
   * @returns True, if it matches.
   */
  private match(ask: Record<string, string>, datum: Record<string, string>) {
    for (const property in ask) {
      if (datum[property] !== "*" && slugify(datum[property]) !== slugify(ask[property])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find a record that matches some known properties, and return its unknown field.
   * @param known The known properties which are matches against.
   * @param unknown The unknown property.
   * @returns The unknown property's value.
   */
  public ask(known: Record<string, string>, unknown: string): Maybe<string> {
    for (const datum of this.data) {
      if (this.match(known, datum)) {
        return datum[unknown];
      }
    }

    return null;
  }

  /**
   * Given some property and value, which records which have the most similar
   * value for that property, and return a specific field.
   * @description If the reference contains no record which matches a
   * [property,value] pair, you can use this to find answers from other, similar
   * records.
   * @param property The property to match against.
   * @param matches The value of that property.
   * @param take The field that you wish to extract from the record.
   * @returns The top suggested field values.
   */
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

  private readonly views = new Map<string, ReferenceView>();

  public view(key: string) {
    const current = this.views.get(key);
    if (current != null) return current;

    const made = new ReferenceView(this.data, key);
    this.views.set(key, made);
    return made;
  }
}

/** ------------------------------------------------------------------------- */

interface ReferenceMeta { path: string, name: string };

export class ReferenceStore extends FileStore<Reference, ReferenceMeta> {
  public getFileFromItem(item: ReferenceMeta): Reply<string> {
    return good(path.join(this.directory, item.path));
  }
  
  public getItemFromFile(file_path: string): Reply<ReferenceMeta> {
    const names = path.relative(this.directory, file_path).split(path.sep);

    const last = names.at(-1);
    if (last == null) {
      return bad("No name!");
    }

    const { name } = path.parse(last);

    return good({ path: names.join(path.sep), name });
  }

  serialize(reference: Reference): Reply<Buffer> {
    return good(Buffer.from(Papa.unparse(reference.data)));
  }

  deserialize(raw: Buffer): Reply<Reference> {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    });

    const parsed = ReferenceSchema.safeParse(data);
    if (parsed.success) {
      console.log("REFERENCE PULL");
      return good(new Reference(parsed.data));
    } else {
      console.log("REFERENCE ERROR", z.prettifyError(parsed.error));
      return bad(z.prettifyError(parsed.error));
    }
  }

  public getTable(name: string): Reference {
    for (const [, entry] of this.entries) {
      if (entry.item.name !== name) continue;
      if (!entry.data.ok) continue;
      return entry.data.data;
    }

    return new Reference([]);
  }

  public async updateTable(name: string, reference: Reference) {
    for (const [, entry] of this.entries) {
      if (entry.item.name !== name) continue;
      await this.push({ item: entry.item, data: good(reference) });
      return;
    }

    await this.push({
      item: { path: `${name}.csv`, name: name },
      data: good(reference)
    });
    return;
  }
}