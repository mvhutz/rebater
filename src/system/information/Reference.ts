import { existsSync } from "fs";
import fs from "fs/promises";
import Papa from "papaparse";
import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

const ReferenceSchema = z.array(z.record(z.string(), z.string()));

export abstract class Reference {
  public abstract save(): Promise<void>;
  public abstract ask(property: string, matches: string, take: string, group?: string): Maybe<string>;
  public abstract append(row: Record<string, string>): void;
}

export class BasicReference extends Reference {
  private path: string;
  private data: Record<string, string>[];

  private constructor(data: Record<string, string>[], path: string) {
    super();
    
    this.path = path;
    this.data = data;
  }

  public append(row: Record<string, string>): void {
    this.data.push(row);
  }

  public ask(property: string, matches: string, take: string, group: string): Maybe<string> {
    const record = this.data.find(record => record[property] === matches && record.group === group);
    if (record == null) return undefined;
    return record[take];
  }

  public async save(): Promise<void> {
    const csv = Papa.unparse(this.data);
    await fs.writeFile(this.path, csv);
  }

  public static async load(path: string): Promise<BasicReference> {
    let data: Record<string,string>[] = [];

    if (existsSync(path)) {
      const raw = await fs.readFile(path, 'utf-8');

      const { data: unclean } = Papa.parse(raw, { header: true });
      data = ReferenceSchema.parse(unclean);
    }
    
    return new BasicReference(data, path);
  }
}

