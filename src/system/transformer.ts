import { glob, readFile, writeFile } from "fs/promises";
import { z } from "zod/v4";
import { TableSchema, TableTransformation } from "./table";
import { Source, SourceSchema } from "./source";
import { State } from "./information/State";
import { Destination, DestinationSchema } from "./destination";
import assert from "assert";
import { SettingsInterface } from "../shared/settings_interface";
import { rewire } from "./util";
import { RowSchema, RowTransformation } from "./row";
import { fromText, makeNodeElementSchema, TextElementSchema } from "./xml";

/** ------------------------------------------------------------------------- */

const TagListSchema = makeNodeElementSchema(
  z.literal("tag"),
  z.undefined(),
  z.array(TextElementSchema).length(1)
);

const SourceListSchema = makeNodeElementSchema(
  z.literal("sources"),
  z.undefined(),
  z.array(Source.getSchema()).default([])
);

const PreprocessSchema = makeNodeElementSchema(
  z.literal("preprocess"),
  z.undefined(),
  z.array(TableTransformation.getSchema()).default([])
);

const PropertySchema = makeNodeElementSchema(
  z.literal("row"),
  z.strictObject({
    name: z.string()
  }),
  z.array(RowTransformation.getSchema()).default([])
);

const PostprocessSchema = makeNodeElementSchema(
  z.literal("postprocess"),
  z.undefined(),
  z.array(TableTransformation.getSchema()).default([])
);

const DestinationListSchema = makeNodeElementSchema(
  z.literal("destinations"),
  z.undefined(),
  z.array(Destination.getSchema()).default([])
);

const TopLevelSchema = z.discriminatedUnion("name", [
  TagListSchema,
  SourceListSchema,
  PreprocessSchema,
  PropertySchema,
  PostprocessSchema,
  DestinationListSchema
])

const TransformerSchema = z.strictObject({
  children: z.tuple([
    makeNodeElementSchema(
      z.literal("transformer"),
      z.strictObject({
        name: z.string()
      }),
      z.array(TopLevelSchema)
    )
  ])
});

export type TransformerData = z.infer<typeof TransformerSchema>;

/** ------------------------------------------------------------------------- */

export class Transformer {
  public data: TransformerData;
  public path: string;

  public name: string;
  public tags: string[];

  private sources: SourceSchema[];
  private preprocessors: TableSchema[];
  private properties: Map<string, RowSchema[]>;
  private postprocessors: TableSchema[];
  private destinations: DestinationSchema[];


  private constructor(_data: TransformerData, path: string) {
    const { children: [data] } = _data;
    this.data = _data;
    this.path = path;

    this.name = data.attributes.name;

    this.sources = [];
    this.preprocessors = [];
    this.properties = new Map();
    this.postprocessors = [];
    this.destinations = [];

    this.tags = [];

    for (const child of data.children) {
      switch (child.name) {
        case "sources": this.sources.push(...child.children); break;
        case "preprocess": this.preprocessors.push(...child.children); break;
        case "row": this.properties.set(child.attributes.name, child.children); break;
        case "postprocess": this.postprocessors.push(...child.children); break;
        case "destinations": this.destinations.push(...child.children); break;
        case "tag": this.tags.push(child.children[0].text); break;
      }
    }
  }

  public static async fromFile(filepath: string): Promise<Transformer> {
    const raw = await readFile(filepath, 'utf-8');
    const json = fromText(raw);
    await writeFile(".json", JSON.stringify(json));

    try {
      return new Transformer(TransformerSchema.parse(json), filepath);
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
      if (filter && !settings.willRun(transformer)) continue;

      transformers.push(transformer);
    }

    return transformers;
  }

  public getSourcesGlobs(state: State): string[] {
    return this.sources.map(source => Source.getFileGlob({ source, state }));
  }

  public async run(state: State): Promise<TransformerResult> {
    const start = performance.now();
    const source_data = Source.runMany(this.sources, { state });
    const preprocessed_data = await TableTransformation.runMany(source_data, this.preprocessors, { state });
    
    const recombined = rewire({
      path: this.path,
      data: [{
        data: this.properties.keys().toArray(),
        table: preprocessed_data[0]
      }]
    });

    const rows = preprocessed_data.map(table => table.data).flat(1);
    for (const row of rows) {
      const result = new Array<string>();

      for (const [, definition] of this.properties) {
        const output = await RowTransformation.runMany(definition, { row, state });
        result.push(output);
      }

      recombined.data.push({ data: result, table: recombined });
    }

    const [postprocessed_data] = await TableTransformation.runMany([recombined], this.postprocessors, { state });
    
    for (const destination of this.destinations) {
      Destination.run(postprocessed_data, { destination, state });
    }

    const end = performance.now();
    return { start, end, name: this.name };
  }
}
