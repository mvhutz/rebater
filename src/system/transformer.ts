import { glob, readFile } from "fs/promises";
import { z } from "zod/v4";
import { rewire } from "./util";
import { BaseDestination, DESTINATION_SCHEMA, DESTINATION_XML_SCHEMA } from "./destination";
import { BaseSource, SOURCE_SCHEMA, SOURCE_XML_SCHEMA } from "./source";
import { BaseTable, TABLE_SCHEMA, TABLE_XML_SCHEMA, runMany as runManyTables } from "./table";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany as runManyRows } from "./row";
import { Settings } from "../shared/settings";
import { TransformerResult } from "../shared/worker/response";
import { Runner } from "./runner/Runner";
import builder from "xmlbuilder";
import { fromText, makeNodeElementSchema, makeTextElementSchema } from "./xml";
import assert from "assert";

/** ------------------------------------------------------------------------- */

export interface TransformerInfo {
  name: string;
  tags: string[];
}

export class Transformer {
  public readonly name: string;
  public readonly tags: string[];
  private readonly sources: BaseSource[];
  private readonly preprocess: BaseTable[];
  private readonly properties: { name: string, definition: BaseRow[] }[];
  private readonly postprocess: BaseTable[];
  private readonly destinations: BaseDestination[];
  private readonly requirements: string[];

  public constructor(name: string, tags: string[], sources: BaseSource[], preprocess: BaseTable[], properties: { name: string, definition: BaseRow[] }[], postprocess: BaseTable[], destinations: BaseDestination[], requirements: string[]) {
    this.name = name;
    this.tags = tags;
    this.sources = sources;
    this.preprocess = preprocess;
    this.properties = properties;
    this.postprocess = postprocess;
    this.destinations = destinations;
    this.requirements = requirements;
  }

  public getInfo(): TransformerInfo {
    return { name: this.name, tags: this.tags };
  }

  public static async fromFile(filepath: string, type: "xml" | "json"): Promise<Transformer> {
    const raw = await readFile(filepath, 'utf-8');

    try {
      if (type === "json") {
        const json = JSON.parse(raw);
        return Transformer.SCHEMA.parse(json);
      } else {
        const xml = fromText(raw);
        return Transformer.XML_SCHEMA.parse(xml);
      }
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
    const transformer_json_files = await Array.fromAsync(glob(settings.getTransformerPathGlob()));
    const transformer_xml_files = await Array.fromAsync(glob(settings.getTransformerPathXMLGlob()));

    const transformers = new Array<Transformer>();
    
    for (const transformer_file of transformer_json_files) {
      const transformer = await Transformer.fromFile(transformer_file, "json");
      if (filter && !settings.willRun(transformer)) continue;

      transformers.push(transformer);
    }

    for (const transformer_file of transformer_xml_files) {
      const transformer = await Transformer.fromFile(transformer_file, "xml");
      if (filter && !settings.willRun(transformer)) continue;

      transformers.push(transformer);
    }

    return transformers;
  }

  public static findValidOrder(transformers: Transformer[]) {
    const by_name = new Map<string, Transformer>();
    
    // No duplicates.
    for (const transformer of transformers) {
      assert.ok(!by_name.has(transformer.name), `Duplicate transformers named '${transformer.name}'!`);
      by_name.set(transformer.name, transformer);
    }

    // Is closed.
    for (const [, transformer] of by_name) {
      for (const requirement of transformer.requirements) {
        assert.ok(by_name.has(requirement), `Transformer '${transformer.name}' requires '${requirement}', which it cannot find!`);
      }
    }

    // Find topological ordering.
    const stack: Transformer[] = [];
    const visited = new WeakSet<Transformer>();

    function DFS(node: Transformer) {
      visited.add(node);

      for (const neighbor_hash of node.requirements) {
        const neighbor = by_name.get(neighbor_hash);
        if (neighbor == null || visited.has(neighbor)) continue;
        DFS(neighbor);
      }

      stack.push(node);
    }

    for (const transformer of transformers) {
      if(visited.has(transformer)) continue;
      DFS(transformer);
    }

    return stack;
  }

  public async runRow(runner: Runner, row: Row) {
    const result = new Array<string>();

    for (const { definition } of this.properties) {
      const output = await runManyRows(definition, row, runner);
      if (output == null) {
        return null;
      }

      result.push(output);
    }

    return result;
  }

  public async run(runner: Runner): Promise<TransformerResult> {
    const start = performance.now();
    const source_data = this.sources.map(s => s.run(runner)).flat(1);
    const preprocessed_data = (await Promise.all(source_data.map(d => runManyTables(this.preprocess, d, runner))));
    
    const recombined = rewire({
      path: "",
      data: [{
        data: this.properties.map(p => p.name),
        table: preprocessed_data[0]
      }]
    });

    const rows = preprocessed_data.map(table => table.data).flat(1);

    for (const row of rows) {
      const transformed = await this.runRow(runner, row);
      
      if (transformed != null) {
        recombined.data.push({ data: transformed, table: recombined });
      }
    }

    const postprocessed_data = await runManyTables(this.postprocess, recombined, runner);
    for (const destination of this.destinations) {
      destination.run(postprocessed_data, runner);
    }

    const end = performance.now();
    return { start, end, name: this.name };
  }

  toXML(): string {
    const root = builder.create("transformer");

    root.element("name", undefined, this.name);
    
    for (const tag of this.tags) {
      root.element("tag", undefined, tag);
    }

    root.txt('');
    root.comment("These source files are extracted.");

    const sources = root.element("sources");
    for (const source of this.sources) {
      source.buildXML(sources);
    }

    if (this.preprocess.length > 0) {
      root.txt('');
      root.comment("Before extraction is done, these operations are done on each table.");

      const preprocess = root.element("preprocess");
      for (const pre of this.preprocess) {
        pre.buildXML(preprocess);
      }
    }

    root.txt('');
    root.comment("Each property which is extracted from each row, of each table.");

    for (const property of this.properties) {
      const child = root.element("property", { name: property.name });
      
      for (const def of property.definition) {
        def.buildXML(child);
      }

      root.txt('');
    }

    if (this.postprocess.length > 0) {
      root.comment("After extraction, these operations are done to the tables.");

      const postprocess = root.element("postprocess");
      for (const post of this.postprocess) {
        post.buildXML(postprocess);
      }

      root.txt('');
    }

    root.comment("The rebates are stored in these locations.");

    const destinations = root.element("destinations");
    for (const destination of this.destinations) {
      destination.buildXML(destinations);
    }
    
    return root.end({ pretty: true, spaceBeforeSlash: " " });
  }

  public static readonly SCHEMA = z.strictObject({
    name: z.string(),
    tags: z.array(z.string()).default([]),
    sources: z.array(SOURCE_SCHEMA),
    requirements: z.array(z.string()).default([]),
    preprocess: z.array(TABLE_SCHEMA).default([]),
    properties: z.array(z.strictObject({
      name: z.string(),
      definition: z.array(ROW_SCHEMA)
    })),
    postprocess: z.array(TABLE_SCHEMA).default([]),
    destination: DESTINATION_SCHEMA,
  }).transform(s => new Transformer(s.name, s.tags, s.sources, s.preprocess, s.properties, s.postprocess, [s.destination], s.requirements));

  private static parseInitialXML(data: z.infer<typeof Transformer.XML_SCHEMA_INITIAL>) {
    const { children } = data;

    let name = "";
    const tags: string[] = [];
    const sources: BaseSource[] = [];
    const preprocess: BaseTable[] = [];
    const properties: { name: string, definition: BaseRow[] }[] = [];
    const postprocess: BaseTable[] = [];
    const destinations: BaseDestination[] = [];
    const requirements: string[] = [];
    
    for (const child of children) {
      switch (child.name) {
        case "name":
          name = child.children[0].text;
          break;
        case "tag":
          tags.push(child.children[0].text);
          break;
        case "sources":
          sources.push(...child.children);
          break;
        case "preprocess":
          preprocess.push(...child.children);
          break;
        case "property":
          properties.push({ name: child.attributes.name, definition: child.children });
          break;
        case "postprocess":
          postprocess.push(...child.children);
          break;
        case "destinations":
          destinations.push(...child.children);
          break;
        case "requires":
          requirements.push(child.children[0].text);
      }
    }

    return new Transformer(name, tags, sources, preprocess, properties, postprocess, destinations, requirements);
  }

  private static readonly XML_SCHEMA_INITIAL = makeNodeElementSchema("transformer", z.undefined(),
    z.array(z.union([
      makeNodeElementSchema("name", z.undefined(), z.tuple([
        makeTextElementSchema(z.string())
      ])),
      makeNodeElementSchema("tag", z.undefined(), z.tuple([
        makeTextElementSchema(z.string())
      ])),
      makeNodeElementSchema("requires", z.undefined(), z.tuple([
        makeTextElementSchema(z.string())
      ])),
      makeNodeElementSchema("sources", z.undefined(), z.array(
        SOURCE_XML_SCHEMA
      )),
      makeNodeElementSchema("preprocess", z.undefined(), z.array(
        TABLE_XML_SCHEMA
      )),
      makeNodeElementSchema("property", z.strictObject({ name: z.string() }), z.array(
        ROW_XML_SCHEMA
      )),
      makeNodeElementSchema("postprocess", z.undefined(), z.array(
        TABLE_XML_SCHEMA
      )),
      makeNodeElementSchema("destinations", z.undefined(), z.array(
        DESTINATION_XML_SCHEMA
      )),
    ]))
  );

  public static readonly XML_SCHEMA: z.ZodType<Transformer> = z.strictObject({
    children: z.tuple([Transformer.XML_SCHEMA_INITIAL])
  }).transform(x => Transformer.parseInitialXML(x.children[0]));
}
