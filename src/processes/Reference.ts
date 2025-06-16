import z from 'zod/v4';
import { makeBasicRegistration } from './Base';
import { ETL } from '../../types';
import MAGIC from '../magic';
import Path from 'path';
import FS from 'fs/promises';
import Papa from 'papaparse';
import assert from 'assert';

/** ------------------------------------------------------------------------- */

const TABLE_CACHE: Record<string, ETL.ReferenceTable> = {};

async function getReferenceTable(name: string): Promise<ETL.ReferenceTable> {
  if ('name' in TABLE_CACHE) return TABLE_CACHE[name];

  const path = Path.join(MAGIC.DIRECTORY, 'tables', `${name}.csv`);

  const file = await FS.readFile(path, 'utf-8');
  const { data: unclean } = Papa.parse(file, { header: true });
  const parsed = z.array(z.record(z.string(), z.string())).parse(unclean);

  const result = { type: "reference", name, data: parsed } as const;
  TABLE_CACHE[name] = result;
  return result;
}

/** ------------------------------------------------------------------------- */

const AttributesSchema = z.object({
  table: z.string(),
  match: z.string(),
  take: z.string(),
});

type Attributes = z.infer<typeof AttributesSchema>;

async function runProcess(attributes: Attributes, data: ETL.Cell[][]): Promise<ETL.Cell[]> {
  const { table, match, take } = attributes;
  const reference_table = await getReferenceTable(table);

  function onValue(datum: string) {
    const row = reference_table.data.find(r => r[match] === datum);
    assert.ok(row != null, `Table '${reference_table.name}' has no item '${datum}' for '${match}'.`);
    return row[take];
  }

  return data.flat(1).map(cell => ({ ...cell, data: onValue(cell.data) }));
}

const Reference = makeBasicRegistration<Attributes, ETL.Cell, ETL.Cell>({
  name: "reference",
  schema: AttributesSchema,
  types: ["cell"],
  act: runProcess
});

/** ------------------------------------------------------------------------- */

export default Reference;
