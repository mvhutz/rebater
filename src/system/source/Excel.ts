import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { State } from "../information/State";
import BaseSource from "./base";
import { makeTable } from "../util";

/** ------------------------------------------------------------------------- */

function getSchema() {
  return z.strictObject({
    type: z.literal("excel"),
    group: z.string(),
    file: z.string().default("*"),
    sheets: z.array(z.string()).optional(),
  });
}

type Schema = z.infer<ReturnType<typeof getSchema>>;

function getSourceFileGlob(source: Schema, state: State) {
  const { group, file } = source;
  return state.getSettings().getSourcePathGlob(group, file, ".xls*");
}

function run(source: Schema, state: State): Table[] {
  const { sheets } = source;
  
  const files = state.pullSourceFileGlob(getSourceFileGlob(source, state));
  const results = new Array<Table>();

  for (const file of files) {
    const workbook = XLSX.read(file.raw, { type: "buffer" });

    const sheetsToTake = new Set<string>();
    if (sheets == null) {
      workbook.SheetNames.forEach(m => sheetsToTake.add(m));
    } else {
      for (const sheet of sheets) {
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

/** ------------------------------------------------------------------------- */

export const ExcelSource: BaseSource<Schema> = { getSchema, run, getSourceFileGlob };