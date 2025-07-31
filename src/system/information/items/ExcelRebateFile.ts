import { Rebate } from "../../../shared/worker/response";
import { AbstractRebateFile } from "./AbstractRebateFile";
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

export class ExcelRebateFile<Meta> extends AbstractRebateFile<Meta> {
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