import { mkdir, readFile, writeFile } from "fs/promises";
import { AbstractItem } from "./AbstractStore";
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../shared/worker/response";
import path from "path";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

export abstract class AbstractRebateFile<T = undefined> extends AbstractItem<Rebate[]> {
  public readonly path: string;
  public readonly meta: T;

  public constructor(path: string, meta: T) {
    super([]);

    this.path = path;
    this.meta = meta;
  }

  hash(): string {
    return this.path;
  }

  abstract serialize(): Buffer;
  abstract deserialize(data: Buffer): unknown;

  async save(): Promise<void> {
    const csv = this.serialize();
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, csv);
  }

  insert(datum: Rebate[]): void {
    this.data.push(...datum);
  }

  protected async fetch(): Promise<Rebate[]> {
    const file = await readFile(this.path);
    const objects = this.deserialize(file);
    return z.array(RebateSchema).parse(objects);
  }
}

/** ------------------------------------------------------------------------- */

export class CSVRebateFile<T> extends AbstractRebateFile<T> {
  serialize(): Buffer {
    return Buffer.from(Papa.unparse(this.data));
  }

  deserialize(data: Buffer): unknown {
    return Papa.parse(data.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    }).data;
  }
}

/** ------------------------------------------------------------------------- */

export class ExcelRebateFile<T> extends AbstractRebateFile<T> {
  serialize(): Buffer {
    const sheet = XLSX.utils.json_to_sheet(this.data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    return XLSX.write(book, { type: "buffer" });
  }

  deserialize(): unknown {
    throw new Error("Cannot deserialize Excel files.");
  }
}