import { mkdir, readFile, writeFile } from "fs/promises";
import { AbstractItem } from "./AbstractStore";
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../shared/worker/response";
import path from "path";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

export abstract class AbstractFile<T, M> extends AbstractItem<T> {
  public readonly path: string;
  public readonly meta: M;

  public constructor(path: string, initial: T, meta: M) {
    super(initial);

    this.path = path;
    this.meta = meta;
  }

  hash(): string {
    return this.path;
  }

  abstract serialize(): Buffer;
  abstract deserialize(data: Buffer): T;

  async save(): Promise<void> {
    const csv = this.serialize();
    await mkdir(path.dirname(this.path), { recursive: true });
    await writeFile(this.path, csv);
  }

  abstract insert(datum: T): void;

  protected async fetch(): Promise<T> {
    const file = await readFile(this.path);
    return this.deserialize(file);
  }
}

/** ------------------------------------------------------------------------- */

export abstract class AbstractRebateFile<M> extends AbstractFile<Rebate[], M> {
  public constructor(path: string, meta: M) {
    super(path, [], meta);
  }

  insert(datum: Rebate[]): void {
    this.data.push(...datum);
  }
}

/** ------------------------------------------------------------------------- */

export class CSVRebateFile<T> extends AbstractRebateFile<T> {
  serialize(): Buffer {
    return Buffer.from(Papa.unparse(this.data));
  }

  deserialize(raw: Buffer): Rebate[] {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    });

    return z.array(RebateSchema).parse(data);
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

  deserialize(): Rebate[] {
    throw new Error("Cannot deserialize Excel files.");
  }
}