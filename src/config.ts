import { glob, readFile } from "node:fs/promises";
import path from "node:path";
import z from "zod/v4";
import { availableAnswers, compareRebates } from "./test";
import RowTransformation from "./row";
import CellTransformation from "./cell";
import Source from "./source";
import Destination from "./destination";

/** ------------------------------------------------------------------------- */

const ConfigSchema = z.object({
  sources: z.array(Source.Schema),
  preprocess: z.array(RowTransformation.Schema).optional(),
  properties: z.array(z.object({
    name: z.string(),
    definition: z.array(CellTransformation.Schema)
  })),
  postprocess: z.array(RowTransformation.Schema).optional(),
  destination: Destination.Schema,
});

type ConfigData = z.infer<typeof ConfigSchema>;

interface Config {
  data: ConfigData;
  name: string;
  path: string;
}

/** ------------------------------------------------------------------------- */

export async function getConfig(file: string): Promise<Config> {
  const raw = await readFile(file, 'utf-8');
  const json = JSON.parse(raw);

  return {
    data: ConfigSchema.parse(json),
    name: path.parse(file).name,
    path: file,
  }
}

export async function runConfig(config: Config, context: Context) {
  const start = performance.now();
  const { preprocess = [], postprocess = [], sources, destination, properties } = config.data;
  const source_data = await Source.runMany(sources, context);
  const preprocessed_data = await RowTransformation.runMany(preprocess, source_data, context);
  
  const recombined: Table = {
    path: config.path,
    data: [{ data: properties.map(p => p.name) }]
  }

  const rows = preprocessed_data.map(table => table.data).flat(1);
  for (const row of rows) {
    const result = new Array<string>();

    for (const { definition } of properties) {
      const output = await CellTransformation.runMany(definition, row, context);
      result.push(output);
    }

    recombined.data.push({ data: result });
  }

  const [postprocessed_data] = await RowTransformation.runMany(postprocess, [recombined], context);
  await Destination.runOnce(destination, postprocessed_data, context);

  const end = performance.now();
  return { start, end, name: config.name };
}

async function findConfigs(context: Context) {  
  const folder = path.join(context.directory, 'transformers', '**/*');

  const results = new Array<string>();

  for await (const file of glob(folder)) {
    results.push(file);
  }

  return results;
}

export async function runAllConfigs(context: Context): Promise<RunResults> {
  const config_files = await findConfigs(context);
  const results: RunResults = {
    config: [],
    discrepency: [],
  }

  for (let c = 0; c < config_files.length; c++) {
    const config_file = config_files[c];

    const name = path.parse(config_file).name;
    const config = await getConfig(config_file);

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`[${c + 1}/${config_files.length}] Running ${name}...`);
    results.config.push(await runConfig(config, context));
  }

  const answers = await availableAnswers(context);
  for (const path of answers) {
    const { file1, file2 } = await compareRebates(`rebates/${path}`, `truth/${path}`, context);

    results.discrepency.push({ name: path, take: file2, drop: file1 })
  }

  return results;
}
