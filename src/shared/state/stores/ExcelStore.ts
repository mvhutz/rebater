import path from "path";
import { bad, good, Reply } from "../../reply";
import { Time, TimeSchema } from "../../time";
import { FileStore } from "./FileStore";
import z from "zod/v4";
import { Rebate } from "../../worker/response";
import * as XLSX from 'xlsx';

/** ------------------------------------------------------------------------- */

interface ExcelMeta { quarter: Time, name: string };

export class ExcelStore extends FileStore<Rebate[], ExcelMeta> {
  protected getFileFromItem(item: ExcelMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.name));
  }

  protected getItemFromFile(file_path: string): Reply<ExcelMeta> {
    const [dot, quarter, ...names] = path.relative(this.directory, file_path).split(path.sep);
    if (dot == "") {
      return bad("File not in directory!");
    }

    const time_schema = TimeSchema.safeParse(quarter);
    if (!time_schema.success) {
      return bad(`Could not parse time '${quarter}': ${z.prettifyError(time_schema.error)}`);
    }

    return good({ quarter: new Time(time_schema.data), name: names.join(path.sep) });
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