import z from "zod/v4";
import XLSX from "xlsx";
import assert from "node:assert";
import { State } from "../information/State";

const NAME = "excel";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  group: z.string(),
  subgroup: z.string(),
  sheets: z.array(z.string()).optional(),
});

type Schema = z.infer<typeof schema>;

async function run(source: Schema, state: State) {
  const { group, subgroup, sheets } = source;
  
  const files = await state.getSettings().listSourcePaths(group, subgroup, state.getTime());

  const results = new Array<Table>();

  for (const file of files) {
    const workbook = XLSX.readFile(file);

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