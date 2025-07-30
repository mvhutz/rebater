import { Time } from "../../shared/time";
import { mkdir, readFile, writeFile } from "fs/promises";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import Papa from 'papaparse';
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../shared/worker/response";
import path from "path";

/** ------------------------------------------------------------------------- */

export class Destination extends AbstractItem<Rebate[]> {
  public readonly group: string;
  public readonly quarter: Time;
  public readonly path: string;

  public constructor(group: string, quarter: Time, path: string) {
    super([]);

    this.group = group;
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

export class DestinationStore extends AbstractStore<Destination, Rebate[]> {
  private directory: string;

  public constructor(directory: string) {
    super();

    this.directory = directory;
  }

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.directory)) {
      const time = Time.parse(time_str);
      if (time == null) continue;

      for (const [group_path, group] of await getSubFolders(time_path)) {
        for (const [file_path] of await getSubFiles(group_path)) {
          this.add(new Destination(group, time, file_path));
        }
      }
    }
  }
}