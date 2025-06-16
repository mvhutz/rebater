import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { nanoid } from 'nanoid';
import XLSX from 'xlsx';
import { ETL } from '../../types';
import assert from 'assert';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  name: z.string(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Workbook[][]): Promise<ETL.Table[]> {
  const { name } = attributes;

  return data.flat(1).map(atom => {
    const sheet = atom.workbook.Sheets[name];
    assert.ok(sheet != null, `Sheet '${name}' does not exist on workbook!`);

    const unclean = XLSX.utils.sheet_to_json(sheet, {
      raw: true,
      blankrows: false,
      defval: '',
      header: 1,
    });

    const id = nanoid();
    const parsed = z.array(z.array(z.coerce.string())).parse(unclean);
    return { type: 'table', data: parsed, table: id, labels: atom.labels };
  });
}

const Sheet = makeBasicRegistration<Attributes, ETL.Workbook, ETL.Table>({
  name: "sheet",
  schema: AttributesSchema,
  types: ["workbook"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Sheet;
