import { glob, readFile } from "fs/promises";
import { z } from "zod/v4";
import { BaseDestination, DESTINATION_SCHEMA, DestinationData } from "../destination";
import { BaseSource, SOURCE_SCHEMA, SourceData } from "../source";
import { BaseTable, TABLE_SCHEMA, TableData } from "../table";
import { BaseRow, ROW_SCHEMA, RowData } from "../row";
import { Settings } from "../../shared/settings";
import { TransformerResult } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import assert from "assert";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface AdvancedTransformerData {
  name: string;
  tags: string[];
  sources: SourceData[];
  requirements: string[];
  preprocess: TableData[];
  properties: {
    name: string,
    definition: RowData[];
  }[],
  postprocess: TableData[];
  destination: DestinationData[];
}

export interface MalformedTransformerFileInfo {
  type: "malformed",
  path: string,
  error: string,
  text: string,
};

export interface AdvancedTransformerFileInfo {
  type: "advanced",
  path: string,
  data: AdvancedTransformerData,
};

export type TransformerFileInfo = AdvancedTransformerFileInfo | MalformedTransformerFileInfo;

/** ------------------------------------------------------------------------- */

/**
 * An individual extractor for the Rebater.
 * 
 * It runs in 5 steps:
 * 
 * 1. First, it searches for all sources that it may need. These are specified
 *    using the `<sources>` tag. For each source, it extracts all of the data
 *    into a list of `Table`, which hold 2D matrix data.
 * 
 * 2. Next, it runs a set of operations on those tables. These are specified in
 *    the `<preprocess>` tag. Examples can be found in the `table` folder. Each
 *    tag takes in a table, and returns a new table, altered in some way.
 * 
 * 3. Next, the tables are all combined, and chopped up into rows. From here,
 *    each row will have various `<property>` extracted from it. The process
 *    is separate for each property, done through defined "row" transformations.
 *    These take a string (and the current row as context) and return a
 *    modified string, based on the type of operation done. Example can be found
 *    in the `row` folder.
 * 
 * 4. Much like the `<preprocess>` tag, the `<postprocess>` tag is run on the
 *    resulting extracted rows.
 * 
 * 5. Finally, the process rebates are written to a set of `<destinations>`.
 *    Examples are in the `destination` folder.
 */
export class AdvancedTransformer {
  public readonly name: string;
  public readonly tags: string[];
  private readonly sources: BaseSource[];
  private readonly preprocess: BaseTable[];
  private readonly properties: { name: string, definition: BaseRow[] }[];
  private readonly postprocess: BaseTable[];
  private readonly destinations: BaseDestination[];
  public readonly requirements: string[];

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

  /**
   * Parse a transformer from a file.
   * @param filepath The location of the file.
   * @param type The format the transformer is in.
   * @returns A new transformer.
   */
  public static async fromFile(filepath: string): Promise<TransformerFileInfo> {
    const raw = await readFile(filepath, 'utf-8');

    try {
      const json = JSON.parse(raw);
      return { type: "advanced", path: filepath, data: AdvancedTransformer.SCHEMA.parse(json).toJSON() };
    } catch (error) {
      let message;

      if (error instanceof z.ZodError) {
        message = `Invalid schema for ${filepath}: ${z.prettifyError(error)}`;
      } else if (error instanceof Error) {
        message = `Invalid schema for ${filepath}: ${error.message}`;
      } else {
        message = `Thrown: ${error}`;
      }

      return { type: "malformed", path: filepath, text: raw, error: message };
    }
  }

  public static async pullAllAvailable(settings: Settings): Promise<TransformerFileInfo[]> {
    const transformer_json_files = await Array.fromAsync(glob(settings.getTransformerPathGlob()));

    const transformers = new Array<TransformerFileInfo>();
    
    for (const transformer_file of transformer_json_files) {
      const transformer_reply = await AdvancedTransformer.fromFile(transformer_file);
      transformers.push(transformer_reply);
    }

    return transformers;
  }

  /**
   * Extract all transformers present in Rebater.
   * @param settings The settings to use to search.
   * @param filter Whether to return all transformers, or just those that will
   * be run.
   * @returns A list of transformers found.
   */
  public static async pullAll(settings: Settings, filter = false): Promise<AdvancedTransformerData[]> {
    const transformer_json_files = await Array.fromAsync(glob(settings.getTransformerPathGlob()));

    const transformers = new Array<AdvancedTransformerData>();
    
    for (const transformer_file of transformer_json_files) {
      const transformer_reply = await AdvancedTransformer.fromFile(transformer_file);
      if (transformer_reply.type === "malformed") continue;

      const { data: transformer } = transformer_reply;
      if (filter && !settings.willRun(transformer)) continue;

      transformers.push(transformer);
    }

    return transformers;
  }

  /**
   * Find a valid order for a set of transformers to run in.
   * @description Certain transformers can require other to run before hand,
   * using the `<requires>` tag. This is useful when one transformer requires
   * another `<utility>` transformer to run beforehand.
   * @param transformers The transformers to sort.
   * @returns The same transformers, ordered in a way that causes no conflicts.
   */
  public static findValidOrder(transformers: AdvancedTransformer[]) {
    const by_name = new Map<string, AdvancedTransformer>();
    
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
    const stack: AdvancedTransformer[] = [];
    const visited = new WeakSet<AdvancedTransformer>();

    function DFS(node: AdvancedTransformer) {
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

  /**
   * Extract the properties from a certain row.
   * @param runner The Runner which is running this transformer.
   * @param row The row being extracted.
   * @returns The extracted properties.
   */
  private runRow(runner: Runner, row: Row, table: Table) {
    const result = new Array<string>();

    for (const { definition } of this.properties) {
      const output = BaseRow.runMany(definition, row, runner, table);
      if (output == null) {
        return null;
      }

      result.push(output);
    }

    return new Row(result, row.source);
  }

  /**
   * Run the transformer.
   * @param runner The context to run in.
   * @returns Information as to how well the transformer ran.
   */
  public run(runner: Runner): TransformerResult {
    const start = performance.now();

    // 1. Pull sources.
    const source_data = this.sources.map(s => s.run(runner)).flat(1);

    // 2. Pre-process data.
    const preprocessed_data = source_data.map(d => BaseTable.runMany(this.preprocess, d, runner));
    const total = Table.stack(...preprocessed_data);
    
    // 3. Extract properties.
    const processed = total.update(r => this.runRow(runner, r, total));

    const header = new Row(this.properties.map(p => p.name), "<header>");
    const final = processed.prepend(header);

    // 4. Post-process data.
    const postprocessed_data = BaseTable.runMany(this.postprocess, final, runner);

    // 5. Send to destinations.
    for (const destination of this.destinations) {
      destination.run(postprocessed_data, runner);
    }

    const end = performance.now();
    return { start, end, name: this.name };
  }

  toJSON(): AdvancedTransformerData {
    return {
      name: this.name,
      tags: this.tags,
      sources: this.sources.map(o => o.buildJSON()),
      requirements: this.requirements,
      preprocess: this.preprocess.map(o => o.buildJSON()),
      properties: this.properties.map(p => ({
        name: p.name,
        definition: p.definition.map(o => o.buildJSON()),
      })),
      postprocess: this.postprocess.map(o => o.buildJSON()),
      destination: this.destinations.map(o => o.buildJSON())
    }
  }

  public static fromJSON(data: AdvancedTransformerData): AdvancedTransformer {
    return AdvancedTransformer.SCHEMA.parse(data);
  }

  /**
   * The JSON schema of a Transformer.
   */
  public static readonly SCHEMA: z.ZodType<AdvancedTransformer, AdvancedTransformerData> = z.strictObject({
    name: z.string(),
    tags: z.array(z.string()),
    sources: z.array(SOURCE_SCHEMA),
    requirements: z.array(z.string()),
    preprocess: z.array(TABLE_SCHEMA),
    properties: z.array(z.strictObject({
      name: z.string(),
      definition: z.array(ROW_SCHEMA)
    })),
    postprocess: z.array(TABLE_SCHEMA),
    destination: z.array(DESTINATION_SCHEMA),
  }).transform(s => new AdvancedTransformer(s.name, s.tags, s.sources, s.preprocess, s.properties, s.postprocess, s.destination, s.requirements));
}
