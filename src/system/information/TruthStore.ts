import { Time } from "../../shared/time";
import { mkdir, readFile, writeFile } from "fs/promises";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import Papa from 'papaparse';
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../shared/worker/response";
import path from "path";

/** ------------------------------------------------------------------------- */

export class Truth extends AbstractItem<Rebate[]> {
  public readonly quarter: Time;
  public readonly path: string;

  public constructor(quarter: Time, path: string) {
    super([]);

    this.quarter = quarter;
    this.path = path;
  }

  hash(): string {
    return this.path;
  }

  async save(): Promise<void> {
    const csv = Papa.unparse(this.data);
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, csv);
  }

  insert(datum: Rebate[]): void {
    this.data.push(...datum);
  }

  protected async fetch(): Promise<Rebate[]> {
    const file = await readFile(this.path, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    return z.array(RebateSchema).parse(data);
  }
}

/** ------------------------------------------------------------------------- */

export class TruthStore extends AbstractStore<Truth, Rebate[]> {
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [file_path] of await getSubFiles(time_path)) {
        this.add(new Truth(time, file_path));
      }
    }
  }
}