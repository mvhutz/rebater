import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class SearchRow implements BaseRow {
  private readonly table: string;
  private readonly take: string;
  private readonly optional: string[];
  private readonly primary?: string;
  private readonly matches: Record<string, BaseRow[]>;

  public constructor(table: string, take: string, matches: Record<string, BaseRow[]>, optional?: string[], primary?: string) {
    this.table = table;
    this.take = take;
    this.matches = matches;
    this.optional = optional ?? [];
    this.primary = primary;
  }

  async run(_value: string, row: Row, runner: Runner): Promise<Maybe<string>> {
    const search = runner.references.get(this.table);

    const values: Record<string, string> = {};
    for (const [property, rows] of Object.entries(this.matches)) {
      const value = await runMany(rows, row, runner);
      if (value == null) return null;

      values[property] = value;
    }

    const result = search.ask(values, this.take);
    if (result != null) {
      return result;
    }

    let suggestions: { key: string; value: string; group: string; }[] = [];
    if (this.primary) {
      suggestions = search.suggest(this.primary, values[this.primary], this.take);
    }

    const { answer } = await runner.asker.ask({
      hash: JSON.stringify([values, this.take]),
      table: this.table,
      unknown: this.take,
      known: values,
      optional: this.optional,
      suggestions: suggestions.slice(0, 3).map(s => (
        `**\`${s.value}\`** for *\`${s.key}\`*, in *${s.group}*.`
      )),
    });
    if (answer == null) return null;
  
    search.insert([answer]);
    return answer[this.take];
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("search"),
    table: z.string(),
    matches: z.record(z.string(), z.strictObject({
      optional: z.boolean().default(false),
      definition: z.array(z.lazy(() => ROW_SCHEMA))
    })).default({}),
    take: z.string(),
  }).transform(s => new SearchRow(s.table, s.take, Object.fromEntries(Object.entries(s.matches).map(m => m[1].definition))));

  buildXML(from: XMLElement): void {
    const parent = from.element("search", {
      table: this.table,
      take: this.take,
    });

    for (const [id, rows] of Object.entries(this.matches)) {
      const child = parent.element("match", { id, default: this.optional.includes(id) });

      for (const row of rows) {
        row.buildXML(child);
      }
    }
  }

  private static readonly PRE_XML_SCHEMA = makeNodeElementSchema("search",
    z.strictObject({
      table: z.string(),
      take: z.string(),
    }),
    z.array(
      makeNodeElementSchema("match",
        z.strictObject({
          id: z.string(),
          primary: z.stringbool().default(false),
          optional: z.stringbool().default(false)
        }),
        z.array(
          z.lazy(() => ROW_XML_SCHEMA)
        )
      )
    )
  );

  private static parseXML(data: z.infer<typeof SearchRow.PRE_XML_SCHEMA>): SearchRow {
    const { table, take } = data.attributes;
    const matches: Record<string, BaseRow[]> = {};
    const optional = [];
    let primary: Maybe<string> = undefined;

    for (const match of data.children) {
      matches[match.attributes.id] = match.children;

      if (match.attributes.optional) {
        optional.push(match.attributes.id);
      }

      if (match.attributes.primary) {
        primary = match.attributes.id;
      }
    }

    return new SearchRow(table, take, matches, optional, primary);
  }

  public static readonly XML_SCHEMA = this.PRE_XML_SCHEMA.transform(this.parseXML);
}
