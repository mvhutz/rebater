import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { State } from "../information/State";
import { makeTable } from "../util";
import { BaseSource } from ".";

/** ------------------------------------------------------------------------- */

export class ExcelSource implements BaseSource {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("excel"),
    group: z.string(),
    file: z.string().default("*"),
    sheets: z.array(z.string()).optional(),
  }).transform(s => new ExcelSource(s.group, s.file, s.sheets));

  private group: string;
  private file: string;
  private sheets?: string[];

  public constructor(group: string, file: string, sheets?: string[]) {
    this.group = group;
    this.file = file;
    this.sheets = sheets;
  }

  getSourceFileGlob(state: State) {
    return state.settings.getSourcePathGlob(this.group, this.file, ".xls*");
  }

  run(state: State): Table[] {
    const files = state.sources.getByGlob(this.getSourceFileGlob(state));
    const results = new Array<Table>();

    for (const file of files) {
      const raw = file.getData();
      assert.ok(raw != null, `Source file '${file.path}' not loaded!`);

      const workbook = XLSX.read(raw, { type: "buffer" });

      const sheetsToTake = new Set<string>();
      if (this.sheets == null) {
        workbook.SheetNames.forEach(m => sheetsToTake.add(m));
      } else {
        for (const sheet of this.sheets) {
          const regex = new RegExp(`^${sheet}$`);
          const matching = workbook.SheetNames.filter(n => regex.test(n));
          matching.forEach(m => sheetsToTake.add(m));
        }
      }

      for (const sheetName of sheetsToTake) {

        const sheet = workbook.Sheets[sheetName];
        assert.ok(sheet != null, `Sheet '${sheetName}' does not exist on workbook!`);

        const unclean = XLSX.utils.sheet_to_json(sheet, {
          raw: true,
          blankrows: false,
          defval: '',
          header: 1,
        });

        const parsed = z.array(z.array(z.coerce.string())).parse(unclean);

        const table = makeTable(parsed, file.path);
        results.push(table);
      }
    }

    return results;
  }
}
