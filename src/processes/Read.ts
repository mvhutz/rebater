import z from 'zod/v4';
import MAGIC from '../magic';
import Path from 'path';
import FS from 'fs/promises';
import { makeBasicRegistration } from './Base';

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  class: z.string(),
  subclass: z.string(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes): Promise<ETL.File[]> {
  const { class: _class, subclass } = attributes;
  
  const path = Path.join(
    MAGIC.DIRECTORY,
    _class,
    subclass, MAGIC.YEAR, `Q${MAGIC.QUARTER}`, '**/*');

  const results = new Array<ETL.File>();

  for await (const file of FS.glob(path)) {
    results.push({
      type: 'file',
      labels: new Set(),
      path: file,
    });
  }

  return results;
}

const Read = makeBasicRegistration<Attributes, ETL.Data, ETL.File>({
  name: "read",
  schema: AttributesSchema,
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Read;
