import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { unparse } from "papaparse";
import z from "zod/v4";

const NAME = "csv";

/** ------------------------------------------------------------------------- */

const schema = z.object({
  type: z.literal(NAME),
  group: z.string(),
  subgroup: z.string(),
});

type Schema = z.infer<typeof schema>;

async function run(destination: Schema, table: Table, context: Context) {
  const { group, subgroup } = destination;
  const directory = path.join(context.directory, group, subgroup);
  const file = path.join(directory, 'guess.csv');
  
  const data = table.data.map(row => row.data);

  await mkdir(directory, { recursive: true });
  await writeFile(file, unparse(data));
}

/** ------------------------------------------------------------------------- */

const CSV = { schema, run, name: NAME };
export default CSV;