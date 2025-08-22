import { z } from "zod/v4";
import { BaseDestination, DESTINATION_SCHEMA, DestinationData } from "../destination";
import { BaseSource, SOURCE_SCHEMA, SourceData } from "../source";
import { BaseTable, TABLE_SCHEMA, TableData } from "../table";
import { BaseRow, ROW_SCHEMA, RowData } from "../row";
import { TransformerResult } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import { Row, Table } from "../information/Table";
import { BaseTransformer } from "./BaseTransformers";

/** ------------------------------------------------------------------------- */

export interface AdvancedTransformerData {
  type: "advanced";
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
export class AdvancedTransformer implements BaseTransformer {
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

  getDetails(): { name: string, tags: string[] } {
    return { name: this.name, tags: this.tags };
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
      type: "advanced",
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
    type: z.literal("advanced"),
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
