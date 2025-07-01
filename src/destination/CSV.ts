
import { unparse } from "papaparse";
import z from "zod/v4";
import { State } from "../information/State";
import fs from 'node:fs/promises';
import path from "node:path";

const NAME = "csv";

/** ------------------------------------------------------------------------- */

const schema = z.strictObject({
  type: z.literal(NAME),
  group: z.string(),
  subgroup: z.string(),
});

type Schema = z.infer<typeof schema>;

async function run(destination: Schema, table: Table, state: State) {
  const { group, subgroup } = destination;
  const filepath = state.getSettings().getDestinationPath(table.path, group, subgroup, state.getTime());
  
  const data = table.data.map(row => row.data);

  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, unparse(data));
}

/** ------------------------------------------------------------------------- */

const CSV = { schema, run, name: NAME };
export default CSV;