import { Rebate } from "../../../shared/worker/response";
import { AbstractRebateFile } from "./AbstractRebateFile";
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

/**
 * An AbstractRebateFile, which stores in Excel format.
 */
export class ExcelRebateFile extends AbstractRebateFile {
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