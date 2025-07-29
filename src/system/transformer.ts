import { glob, readFile } from "fs/promises";
import path from "path";
import { z } from "zod/v4";
import { rewire } from "./util";
import { DESTINATION_SCHEMA } from "./destination";
import { SOURCE_SCHEMA } from "./source";
import { TABLE_SCHEMA, runMany as runManyTables } from "./table";
import { ROW_SCHEMA, runMany as runManyRows } from "./row";
import { Settings } from "../shared/settings";
import { TransformerResult } from "../shared/worker/response";
import { Runner } from "./runner/Runner";

/** ------------------------------------------------------------------------- */

const DataSchema = z.strictObject({
  name: z.string(),
  tags: z.array(z.string()).default([]),
  sources: z.array(SOURCE_SCHEMA),
  preprocess: z.array(TABLE_SCHEMA).optional(),
  properties: z.array(z.strictObject({
    name: z.string(),
    definition: z.array(ROW_SCHEMA)
  })),
  postprocess: z.array(TABLE_SCHEMA).optional(),
  destination: DESTINATION_SCHEMA,
});

export type TransformerData = z.infer<typeof DataSchema>;

/** ------------------------------------------------------------------------- */

export class Transformer {
  public data: TransformerData;
  public name: string;
  public path: string;

  private constructor(data: TransformerData, name: string, path: string) {
    this.data = data;
    this.name = name;
    this.path = path;
  }

  public static async fromFile(filepath: string): Promise<Transformer> {
    const raw = await readFile(filepath, 'utf-8');
    const json = JSON.parse(raw);

    try {
      const name = path.parse(filepath).name;
      return new Transformer(DataSchema.parse(json), name, filepath);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw Error(`Invalid schema for ${filepath}: ${z.prettifyError(error)}`);
      } else if (error instanceof Error) {
        throw Error(`Invalid schema for ${filepath}: ${error.message}`);
      } else {
        throw Error(`Thrown: ${error}`);
      }
    }
  }

  public static async pullAll(settings: Settings, filter = false) {
    const transformer_glob = settings.getTransformerPathGlob();
    const transformer_files = await Array.fromAsync(glob(transformer_glob));

    const transformers = new Array<Transformer>();
    for (const transformer_file of transformer_files) {
      const transformer = await Transformer.fromFile(transformer_file);
      if (filter && !settings.willRun(transformer.data)) continue;

      transformers.push(transformer);
    }

    return transformers;
  }

  public async run(runner: Runner): Promise<TransformerResult> {
    const start = performance.now();
    const { preprocess = [], postprocess = [], sources, destination, properties } = this.data;
    const source_data = sources.map(s => s.run(runner)).flat(1);
    const preprocessed_data = (await Promise.all(source_data.map(d => runManyTables(preprocess, d, runner))));
    
    const recombined = rewire({
      path: this.path,
      data: [{
        data: properties.map(p => p.name),
        table: preprocessed_data[0]
      }]
    });

    const rows = preprocessed_data.map(table => table.data).flat(1);

    for (const row of rows) {
      const result = new Array<string>();
      let bad = false;

      for (const { definition } of properties) {
        const output = await runManyRows(definition, row, runner);
        if (output == null) {
          bad = true;
          break;
        }
        result.push(output);
      }

      if (bad) {
        continue;
      }

      recombined.data.push({ data: result, table: recombined });
    }

    const postprocessed_data = await runManyTables(postprocess, recombined, runner);
    destination.run(postprocessed_data, runner);

    const end = performance.now();
    return { start, end, name: this.name };
  }
}
