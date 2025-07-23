import Papa from "papaparse";
import { z } from "zod/v4";

/** ------------------------------------------------------------------------- */

export class Reference {
  public static readonly SCHEMA = z.array(z.record(z.string(), z.string()));
  private data = new Array<Record<string, string>>();

  public append(...rows: Record<string, string>[]): void {
    this.data.push(...rows);
  }

  public add(o: Reference) {
    this.data.push(...o.data);
  }

  public ask(property: string, matches: string, take: string, group: string): Maybe<string> {
    const record = this.data.find(record => record[property] === matches && record.group === group);
    if (record == null) return undefined;
    return record[take];
  }

  public toRaw(): string {
    return Papa.unparse(this.data);
  }

  public static fromRaw(raw: string): Reference {
    const { data: unclean } = Papa.parse(raw, { header: true });
    const data = Reference.SCHEMA.parse(unclean);
    
    const reference = new Reference();
    reference.append(...data);
    return reference;
  }
}

