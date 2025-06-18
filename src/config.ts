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
  properties: z.record(z.string(), z.array(CellTransformation.Schema)),
  postprocess: z.array(RowTransformation.Schema).optional(),
  destination: Destination.Schema,
});

type Config = z.infer<typeof ConfigSchema>;

/** ------------------------------------------------------------------------- */

export async function getConfig(path: string): Promise<Config> {
  const file = await readFile(path, 'utf-8');
  const json = JSON.parse(file);
  return ConfigSchema.parse(json);
}

export async function runConfig(config: Config, context: Context) {
  const start = performance.now();
  const { preprocess = [], postprocess = [] } = config;
  const sources = await Source.runMany(config.sources, context);

  const preprocessed = await RowTransformation.runMany(preprocess, sources, context);

  const rows = preprocessed.map(table => table.data).flat(1);
  const recombined: Table = {
    path: "<None>",
    data: [
      {
        data: Object.keys(config.properties)
      }
    ]
  }

  for (const row of rows) {
    const result = new Array<string>();

    for (const transformations of Object.values(config.properties)) {
      const output = await CellTransformation.runMany(transformations, row, context);
      result.push(output);
    }

    recombined.data.push({
      data: result
    });
  }

  const [postprocessed] = await RowTransformation.runMany(postprocess, [recombined], context);
  await Destination.runOnce(config.destination, postprocessed, context);

  const end = performance.now();
  return { start, end };
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

  for (const config_file of config_files) {
    const name = path.parse(config_file).name;
    const config = await getConfig(config_file);

    console.log(`Running ${name}...`)
    const { start, end} = await runConfig(config, context);

    results.config.push({ start, end, name });
  }

  const answers = await availableAnswers(context);
  for (const path of answers) {
    const { file1, file2 } = await compareRebates(`rebates/${path}`, `truth/${path}`, {
      ignore: ['purchaseId'],
      context
    });

    results.discrepency.push({ name: path, take: file2, drop: file1 })
  }

  return results;
}
