import consola from "consola";
import mutexify from "mutexify/promise";
import assert from "node:assert";
import { readFile, writeFile } from "node:fs/promises";
import { parse, unparse } from "papaparse";
import path from "path";
import z from "zod/v4";

const NAME = "reference";

/** ------------------------------------------------------------------------- */

async function getReference(name: string, context: Context): Promise<Reference> {
  if (context.references.has(name)) return context.references.get(name)!;

  const file = path.join(context.directory, 'tables', `${name}.csv`);
  const raw = await readFile(file, 'utf-8');

  const { data: unclean } = parse(raw, { header: true });
  const data = z.array(z.record(z.string(), z.string())).parse(unclean);

  const result = { path: file, data };

  context.references.set(name, result);
  return result;
}

async function appendReferenceTable(table: Reference, row: Record<string, string>) {
  table.data.push(row);
  await writeFile(table.path, unparse(table.data));
}

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal("reference"),
  table: z.string(),
  match: z.string(),
  take: z.string(),
  group: z.string(),
});

type Transformation = z.infer<typeof schema>;

const lock = mutexify();

async function run(transformation: Transformation, value: string, row: Row, context: Context) {
  const { table, match, take, group } = transformation;
  const reference = await getReference(table, context);

  const release = await lock();

  const record = reference.data.find(record => record[match] === value && record.group === group);
  if (record != null) {
    release();
    return record[take];
  }
  
  const answer = await consola.prompt(`For '${group}', the '${take}' of '${value}' is?`, {
    type: "text",
    cancel: "reject"
  });

  assert.ok(answer != null, `Table '${table}' has no item '${value}' for '${match}'.`);

  await appendReferenceTable(reference, { [match]: value, [take]: answer, group: group });

  release();
  return answer;
}

const Reference = { schema, run, name: NAME };
export default Reference;
