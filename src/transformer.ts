import { readFile } from "node:fs/promises";
import path from "node:path";
import z from "zod/v4";
import { compareRebates } from "./test";
import RowTransformation from "./row";
import CellTransformation from "./cell";
import Source from "./source";
import Destination from "./destination";
import { State } from "./information/State";

/** ------------------------------------------------------------------------- */

const TransformerSchema = z.strictObject({
  sources: z.array(Source.Schema),
  preprocess: z.array(RowTransformation.Schema).optional(),
  properties: z.array(z.strictObject({
    name: z.string(),
    definition: z.array(CellTransformation.Schema)
  })),
  postprocess: z.array(RowTransformation.Schema).optional(),
  destination: Destination.Schema,
});

type Transformer = z.infer<typeof TransformerSchema>;

interface Settings {
  data: Transformer;
  name: string;
  path: string;
}

/** ------------------------------------------------------------------------- */

export async function getConfig(file: string): Promise<Settings> {
  const raw = await readFile(file, 'utf-8');
  const json = JSON.parse(raw);

  return {
    data: TransformerSchema.parse(json),
    name: path.parse(file).name,
    path: file,
  }
}

export async function runConfig(config: Settings, state: State) {
  const start = performance.now();
  const { preprocess = [], postprocess = [], sources, destination, properties } = config.data;
  const source_data = await Source.runMany(sources, state);
  const preprocessed_data = await RowTransformation.runMany(preprocess, source_data, state);
  
  const recombined: Table = {
    path: config.path,
    data: [{ data: properties.map(p => p.name) }]
  }

  const rows = preprocessed_data.map(table => table.data).flat(1);
  for (const row of rows) {
    const result = new Array<string>();

    for (const { definition } of properties) {
      const output = await CellTransformation.runMany(definition, row, state);
      result.push(output);
    }

    recombined.data.push({ data: result });
  }

  const [postprocessed_data] = await RowTransformation.runMany(postprocess, [recombined], state);
  await Destination.runOnce(destination, postprocessed_data, state);

  const end = performance.now();
  return { start, end, name: config.name };
}

export async function runAllConfigs(state: State): Promise<RunResults> {
  const transformer_files = await state.getSettings().listTransformerPaths();

  const results: RunResults = {
    config: [],
    discrepency: [],
  }

  for (const [index, transformer_file] of transformer_files.entries()) {
    const name = path.parse(transformer_file).name;
    const transformer = await getConfig(transformer_file);

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`[${index + 1}/${transformer_files.length}] Running ${name}...`);
    results.config.push(await runConfig(transformer, state));
  }

  const rebates_groups = await state.getSettings().listActualGroups();
  for (const group of rebates_groups) {
    const { take, drop } = await compareRebates(group, state);

    results.discrepency.push({ name: group, take, drop })
  }

  return results;
}
