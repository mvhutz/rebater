import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import MAGIC from '../magic';
import Path from 'path';
import FS from 'fs/promises';
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  as: z.union([z.literal("csv")]).default("csv"),
  class: z.string(),
  subclass: z.string(),
  headers: z.string().optional(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Table[][]): Promise<ETL.File[]> {
  const { class: _class, subclass, headers: headerString } = attributes;
  
  const results = data.flat(1).map(async (table, i) => {
    const directory = Path.join(MAGIC.DIRECTORY, _class, subclass);
    const file = Path.join(directory, `${i}.csv`);

    const data = [...table.data];
    if (headerString != null) {
      const headers = headerString.split(',');
      data.unshift(headers);
    }

    await FS.mkdir(directory, { recursive: true });
    await FS.writeFile(file, Papa.unparse(data));

    return { type: 'file', labels: table.labels, path: file } as const;
  });

  return await Promise.all(results);
}

const Write = makeBasicRegistration<Attributes, ETL.Table, ETL.File>({
  name: "write",
  schema: AttributesSchema,
  types: ["table"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Write;
