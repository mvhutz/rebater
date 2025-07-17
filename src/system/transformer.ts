import { glob, readFile } from "fs/promises";
import path from "path";
import { z } from "zod/v4";
import TableTransformation from "./table";
import { Source } from "./source";
import { State } from "./information/State";
import { Destination } from "./destination";
import assert from "assert";
import { SettingsInterface } from "../shared/settings_interface";
import { rewire } from "./util";
import { RowTransformation } from "./row";

/** ------------------------------------------------------------------------- */

const DataSchema = z.strictObject({
  name: z.string(),
  tags: z.array(z.string()).default([]),
  sources: z.array(Source.getSchema()),
  preprocess: z.array(TableTransformation.Schema).optional(),
  properties: z.array(z.strictObject({
    name: z.string(),
    definition: z.array(RowTransformation.getSchema())
  })),
  postprocess: z.array(TableTransformation.Schema).optional(),
  destination: Destination.getSchema(),
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
      assert.ok(error instanceof z.ZodError);
      throw Error(`Invalid schema for ${filepath}: ${z.prettifyError(error)}`)
    }
  }

  public static async pullAll(settings: SettingsInterface, filter = false) {
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

  public getSourcesGlobs(state: State): string[] {
    return this.data.sources.map(s => Source.getSourceFileGlob(s, state));
  }

  public async run(state: State): Promise<TransformerResult> {
    const start = performance.now();
    const { preprocess = [], postprocess = [], sources, destination, properties } = this.data;
    const source_data = Source.runMany(sources, state);
    const preprocessed_data = await TableTransformation.runMany(preprocess, source_data, state);
    
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

      for (const { definition } of properties) {
        const output = await RowTransformation.runMany(definition, { row, state });
        result.push(output);
      }

      recombined.data.push({ data: result, table: recombined });
    }

    const [postprocessed_data] = await TableTransformation.runMany(postprocess, [recombined], state);
    Destination.run(postprocessed_data, { destination, state });

    const end = performance.now();
    return { start, end, name: this.name };
  }
}
