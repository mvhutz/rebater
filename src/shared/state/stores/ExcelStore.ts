import path from "path";
import { good, Replier, Reply } from "../../reply";
import { Time } from "../../time";
import { FileStore } from "./FileStore";
import { Rebate } from "../../worker/response";
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

interface ExcelMeta { quarter: Time, name: string };

export class ExcelStore extends FileStore<Rebate[], ExcelMeta> {
  protected getFileFromItem(item: ExcelMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.name));
  }

  protected getItemFromFile(file_path: string): Reply<ExcelMeta> {
    const [quarter, ...names] = path.relative(this.directory, file_path).split(path.sep);

    return Replier.of(Time.parse(quarter))
      .map(t => ({ quarter: t, name: names.join(path.sep) }))
      .end();
  }

  serialize(data: Rebate[]): Reply<Buffer> {
    const sheet = XLSX.utils.json_to_sheet(data);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    return XLSX.write(book, { type: "buffer" });
  }
  
  deserialize(): Reply<Rebate[]> {
    throw new Error("Cannot deserialize Excel files.");
  }
}