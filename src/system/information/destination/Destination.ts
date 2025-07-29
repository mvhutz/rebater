import { readFile, writeFile } from "fs/promises";
import { Time } from "../../../shared/time";
import Papa from "papaparse";
import { RebateSchema } from "../../../shared/worker/response";
import z from "zod/v4";
import { Rebate } from "../../util";

/** ------------------------------------------------------------------------- */

export class Destination {
  public readonly group: string;
  public readonly quarter: Time;
  public readonly path: string;

  private data?: Rebate[];
  private _loaded: boolean;

  public constructor(group: string, quarter: Time, path: string) {
    this.group = group;
    this.quarter = quarter;
    this.path = path;
    this._loaded = false;
  }

  public add(other: Destination) {
    this.append(other.data ?? []);
  }

  public append(data: Rebate[]) {
    this.data ??= [];
    this.data.push(...data);
  }

  public async load(): Promise<void> {
    const file = await readFile(this.path, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    this.data = z.array(RebateSchema).parse(data);
    this._loaded = true;
  }

  public async save(): Promise<boolean> {
    if (this.data == null) {
      return false;
    }

    const csv = Papa.unparse(this.data);
    await writeFile(this.path, csv);
    return true;
  }

  public get rebates(): Rebate[] {
    return this.data ?? [];
  }

  public get loaded(): boolean {
    return this._loaded;
  }
}