import { DestinationOperator } from "../destination";
import { Row, Table } from "../information/Table";
import { Transformer } from "./Transformer";
import { AdvancedTransformerData, DestinationData, RowData, SourceData, TableData } from "../../shared/transformer/advanced";
import { RebateDestinationOperator } from "../destination/Rebate";
import { UtilityDestinationOperator } from "../destination/Utility";
import { SourceOperator } from "../source";
import { ExcelSourceOperator } from "../source/Excel";
import { TableOperator } from "../table";
import { RowOperator } from "../row";
import { AbsoluteRowOperator } from "../row/Absolute";
import { AddRowOperator } from "../row/Add";
import { CharacterRow } from "../row/Character";
import { CoerceNumberRow } from "../row/CoerceNumber";
import { CoerceDateRow } from "../row/CoerceDate";
import { ColumnRow } from "../row/Column";
import { CoerceUSDRow } from "../row/CoerceUSD";
import { ConcatRow } from "../row/Concat";
import { CounterRow } from "../row/Counter";
import { DivideRow } from "../row/Divide";
import { EqualsRow } from "../row/Equals";
import { LiteralRow } from "../row/Literal";
import { MetaRow } from "../row/Meta";
import { MultiplyRow } from "../row/Multiply";
import { ReferenceRow } from "../row/Reference";
import { ReplaceRow } from "../row/Replace";
import { SearchRow } from "../row/Search";
import { SignumRow } from "../row/Sign";
import { SubtractRow } from "../row/Subtract";
import { SumRow } from "../row/Sum";
import { TrimRow } from "../row/Trim";
import { UtilityRow } from "../row/Utility";
import { ChopTable } from "../table/Chop";
import { CoalesceTable } from "../table/Coalesce";
import { DebugTable } from "../table/Debug";
import { FilterTable } from "../table/Filter";
import { HeaderTable } from "../table/Header";
import { PercolateTable } from "../table/Percolate";
import { SelectTable } from "../table/Select";
import { SetTable } from "../table/Set";
import { TrimTable } from "../table/Trim";
import { State } from "../../shared/state";
import { Context } from "../../shared/context";
import { StatsData } from "../../shared/stats";

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
export class AdvancedTransformer implements Transformer {
  public readonly name: string;
  public readonly tags: string[];
  private readonly sources: SourceOperator[];
  private readonly preprocess: TableOperator[];
  private readonly properties: { name: string, definition: RowOperator[] }[];
  private readonly postprocess: TableOperator[];
  private readonly destinations: DestinationOperator[];
  public readonly requirements: string[];

  public static parseDestination(data: DestinationData): DestinationOperator {
    switch (data.type) {
      case "rebate": return new RebateDestinationOperator(data);
      case "utility": return new UtilityDestinationOperator(data);
    }
  }

  public static parseRow(data: RowData): RowOperator {
    switch (data.type) {
      case "abs": return new AbsoluteRowOperator();
      case "add": return new AddRowOperator(data);
      case "character": return new CharacterRow(data);
      case "coerce":
        switch (data.as) {
          case "number": return new CoerceNumberRow(data);
          case "date": return new CoerceDateRow(data);
          case "usd": return new CoerceUSDRow(data);
          default: throw new Error();
        }
      case "column": return new ColumnRow(data);
      case "concat": return new ConcatRow(data);
      case "counter": return new CounterRow();
      case "divide": return new DivideRow(data);
      case "equals": return new EqualsRow(data);
      case "literal": return new LiteralRow(data);
      case "meta": return new MetaRow(data);
      case "multiply": return new MultiplyRow(data);
      case "reference": return new ReferenceRow(data);
      case "replace": return new ReplaceRow(data);
      case "search": return new SearchRow(data);
      case "sign": return new SignumRow();
      case "subtract": return new SubtractRow(data);
      case "sum": return new SumRow(data);
      case "trim": return new TrimRow();
      case "utility": return new UtilityRow(data);
    }
  }

  public static parseTable(data: TableData): TableOperator {
    switch (data.type) {
      case "chop": return new ChopTable(data);
      case "coalesce": return new CoalesceTable(data);
      case "debug": return new DebugTable(data);
      case "filter": return new FilterTable(data);
      case "header": return new HeaderTable(data);
      case "percolate": return new PercolateTable(data);
      case "select": return new SelectTable(data);
      case "set": return new SetTable(data);
      case "trim": return new TrimTable(data);
    }
  }

  public static parseSource(data: SourceData): SourceOperator {
    switch (data.type) {
      case "excel": return new ExcelSourceOperator(data);
    }
  }

  public constructor(data: AdvancedTransformerData) {
    this.name = data.name;
    this.tags = data.tags;
    this.sources = data.sources.map(AdvancedTransformer.parseSource);
    this.preprocess = data.preprocess.map(AdvancedTransformer.parseTable);
    this.properties = data.properties.map(p => ({
      name: p.name,
      definition: p.definition.map(AdvancedTransformer.parseRow),
    }));
    this.postprocess = data.postprocess.map(AdvancedTransformer.parseTable);
    this.destinations = data.destination.map(AdvancedTransformer.parseDestination);
    this.requirements = data.requirements;
  }

  public getDeps(): string[] {
    return this.requirements;
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
  private runRow(state: State, row: Row, table: Table, context: Context, stats: StatsData) {
    const result = new Array<string>();

    for (const { definition } of this.properties) {
      const output = RowOperator.runMany(definition, { row, state, table, context });
      if (!output.ok) {
        stats.issues.ignored_row.push({
          transformer: this.name,
          row: row.split() as string[],
          source: row.source,
          reason: output.reason
        });

        return null;
      }

      result.push(output.data);
    }

    return new Row(result, row.source);
  }

  public run(state: State, context: Context, stats: StatsData): void {
    const start = performance.now();

    // 1. Pull sources.
    const source_data = this.sources.map(s => s.run({ state, context, stats, transformer: this.name })).flat(1);
    if (source_data.length === 0) {
      const end = performance.now();
      stats.performance.push({ start, end, name: this.name });
      stats.issues.no_source.push({ transformer: this.name });
      return;
    }

    // 2. Pre-process data.
    const preprocessed_data = source_data.map(table => TableOperator.runMany(this.preprocess, { table, state, context, stats, transformer: this.name }));
    const preprocessed_data_filtered = preprocessed_data.filter(table => {
      if (table.size() !== 0) return true;

      stats.issues.empty_sheet.push({
        transformer: this.name,
        group: table.info?.group ?? "Unknown",
        source: table.info?.file ?? "Unknown",
        sheet: table.info?.sheet ?? "Unknown"
      });

      return false;
    })
    
    const total = Table.stack(preprocessed_data_filtered, null);

    // 3. Extract properties.
    const processed = total.update(r => this.runRow(state, r, total, context, stats));

    const header = new Row(this.properties.map(p => p.name), "<header>");
    const final = processed.prepend(header);

    // 4. Post-process data.
    const postprocessed_data = TableOperator.runMany(this.postprocess, { table: final, state, context, stats, transformer: this.name });

    // 5. Send to destinations.
    for (const destination of this.destinations) {
      destination.run({ table: postprocessed_data, state, context });
    }

    const end = performance.now();
    stats.performance.push({ start, end, name: this.name });
  }
}
