import { Time } from "../../shared/time";
import { mkdir, writeFile } from "fs/promises";
import { getSubFiles, getSubFolders } from "../util";
import { AbstractItem, AbstractStore } from "./AbstractStore";
import path from "path";
import * as XLSX from 'xlsx';
import { Rebate } from "../../shared/worker/response";

/** ------------------------------------------------------------------------- */

export class Output extends AbstractItem<Rebate[]> {
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
    const sheet = XLSX.utils.json_to_sheet(this.data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    const buffer = XLSX.write(book, { type: "buffer" });
    
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, buffer);
  }

  insert(datum: Rebate[]): void {
    this.data.push(...datum);
  }

  protected async fetch(): Promise<Rebate[]> {
    throw new Error("Cannot import output files.");
  }
}

/** ------------------------------------------------------------------------- */

export class OutputStore extends AbstractStore<Output, Rebate[]> {
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
        this.add(new Output(time, file_path));
      }
    }
  }
}