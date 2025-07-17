import { z } from "zod/v4";
import * as XLSX from "xlsx";
import assert from "assert";
import { makeTable } from "../../util";
import { Source } from ".";
import { makeNodeElementSchema } from "../../xml";

/** ------------------------------------------------------------------------- */

const getSchema = () => makeNodeElementSchema(
  z.literal("excel"),
  z.strictObject({
    group: z.string(),
    file: z.string().default("*"),
    sheets: z.string().default(""),
  }),
  z.undefined()
)

type Schema = z.infer<ReturnType<typeof getSchema>>;

/** ------------------------------------------------------------------------- */

export const Excel: Source<Schema> = {
  name: "excel",
  getSchema,

  getFileGlob({ state, source: { attributes: { group, file } } }) {
    return state.getSettings().getSourcePathGlob(group, file, ".xls*");
  },

  run(options) {  
    const { state, source: { attributes: { sheets } } } = options;

    const files = state.pullSourceFileGlob(Excel.getFileGlob(options));
    const results = new Array<Table>();

    for (const file of files) {
      const workbook = XLSX.read(file.raw, { type: "buffer" });

      const sheetsToTake = new Set<string>();
      const sheet_list = sheets.split(",");
      
      if (sheet_list == null) {
        workbook.SheetNames.forEach(m => sheetsToTake.add(m));
      } else {
        for (const sheet of sheet_list) {
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
        results.push(makeTable(parsed, file.path));
      }
    }

    return results;
  },
};