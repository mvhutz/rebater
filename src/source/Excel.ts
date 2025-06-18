import { glob } from "node:fs/promises";
import path from "node:path";
import z from "zod/v4";
import XLSX from "xlsx";
import assert from "node:assert";

const NAME = "excel";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  group: z.string(),
  subgroup: z.string(),
  sheets: z.array(z.string()).optional(),
});

type Schema = z.infer<typeof schema>;

async function run(source: Schema, context: Context) {
  const { group, subgroup, sheets } = source;
  
  const folder = path.join(
    context.directory,
    group,
    subgroup,
    `${context.year}`,
    `Q${context.quarter}`,
    '**/*'
  );

  const results = new Array<Table>();

  for await (const file of glob(folder)) {
    const workbook = XLSX.readFile(file);

    const sheetsToTake = sheets ?? workbook.SheetNames;
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
      results.push({
        path: file,
        data: parsed.map(data => ({ group, data }))
      });
    }
  }

  return results;
}

/** ------------------------------------------------------------------------- */

const Excel = { schema, run, name: NAME };
export default Excel;