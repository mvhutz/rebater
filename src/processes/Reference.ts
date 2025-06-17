import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import MAGIC from '../magic';
import Path from 'path';
import FS from 'fs/promises';
import Papa from 'papaparse';
import assert from 'assert';
import mutexify from 'mutexify/promise';
import consola from 'consola';

/** ------------------------------------------------------------------------- */

const TABLE_CACHE: Record<string, ETL.ReferenceTable> = {};

async function getReferenceTable(name: string): Promise<ETL.ReferenceTable> {
  if ('name' in TABLE_CACHE) return TABLE_CACHE[name];

  const path = Path.join(MAGIC.DIRECTORY, 'tables', `${name}.csv`);

  const file = await FS.readFile(path, 'utf-8');
  const { data: unclean } = Papa.parse(file, { header: true });
  const parsed = z.array(z.record(z.string(), z.string())).parse(unclean);

  const result = { type: "reference", name, data: parsed, path } as const;
  TABLE_CACHE[name] = result;
  return result;
}

async function appendReferenceTable(table: ETL.ReferenceTable, row: Record<string, string>) {
  table.data.push(row);
  await FS.writeFile(table.path, Papa.unparse(table.data));
}

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  table: z.string(),
  match: z.string(),
  take: z.string(),
  group: z.string(),
});

type Attributes = z.infer<typeof AttributesSchema>;

const lock = mutexify();

async function runProcess(attributes: Attributes, data: ETL.Cell[][]): Promise<ETL.Cell[]> {
  const { table, match, take, group } = attributes;
  const reference_table = await getReferenceTable(table);

  async function onValue(datum: string) {
    const release = await lock();

    const row = reference_table.data.find(r => r[match] === datum && r.group === group);
    if (row != null) {
      release();
      return row[take];
    }
    
    const answer = await consola.prompt(`For '${group}', the '${take}' of '${datum}' is?`, {
      type: "text",
      cancel: "reject"
    });

    assert.ok(answer != null, `Table '${reference_table.name}' has no item '${datum}' for '${match}'.`);

    await appendReferenceTable(reference_table, { [match]: datum, [take]: answer, group: group });

    release();
    return answer;
  }

  return await Promise.all(data.flat(1).map(async cell => ({ ...cell, data: await onValue(cell.data) })));
}

const Reference = makeBasicRegistration<Attributes, ETL.Cell, ETL.Cell>({
  name: "reference",
  schema: AttributesSchema,
  types: ["cell"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Reference;
