import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod/v4";
import TableTransformation from "./table";
import RowTransformation from "./row";
import Source from "./source";
import Destination from "./destination";
import { State } from "./information/State";

/** ------------------------------------------------------------------------- */

const DataSchema = z.strictObject({
  sources: z.array(Source.Schema),
  preprocess: z.array(TableTransformation.Schema).optional(),
  properties: z.array(z.strictObject({
    name: z.string(),
    definition: z.array(RowTransformation.Schema)
  })),
  postprocess: z.array(TableTransformation.Schema).optional(),
  destination: Destination.Schema,
});

type Data = z.infer<typeof DataSchema>;

/** ------------------------------------------------------------------------- */

export class Transformer {
  public data: Data;
  public name: string;
  public path: string;

  private constructor(data: Data, name: string, path: string) {
    this.data = data;
    this.name = name;
    this.path = path;
}

  public static async fromFile(filepath: string): Promise<Transformer> {
  const raw = await readFile(filepath, 'utf-8');
  const json = JSON.parse(raw);

  const name = path.parse(filepath).name;
    return new Transformer(DataSchema.parse(json), name, filepath);
}

  public async run(state: State): Promise<TransformerResult> {
    const start = performance.now();
    const { preprocess = [], postprocess = [], sources, destination, properties } = this.data;
    const source_data = await Source.runMany(sources, state);
    const preprocessed_data = await TableTransformation.runMany(preprocess, source_data, state);
    
    const recombined: Table = {
      path: this.path,
      data: [{ data: properties.map(p => p.name) }]
    }

    const rows = preprocessed_data.map(table => table.data).flat(1);
    for (const row of rows) {
      const result = new Array<string>();

      for (const { definition } of properties) {
        const output = await RowTransformation.runMany(definition, row, state);
        result.push(output);
      }

      recombined.data.push({ data: result });
    }

    const [postprocessed_data] = await TableTransformation.runMany(postprocess, [recombined], state);
    await Destination.runOnce(destination, postprocessed_data, state);

    const end = performance.now();
    return { start, end, name: this.name };
  }
}
