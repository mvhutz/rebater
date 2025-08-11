import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * A generalized version of `<reference>`.
 * 
 * Given a reference, it searches that table for a matching record.
 * 
 * To determine a match, it uses the "matches" object. For each [key, rows] in
 * "matches", it checks whether the value of the key in the record, matches the
 * resulting value generated from the set of row transformation. The first
 * record that matches all keys is chosen. The value of its "take" property is
 * returned.
 * 
 * When no record is found, it asks the user for input:
 * - If a property is "optional", then the question will be directed for all
 *   records, not just those with the specific value of this property.
 * - If a property is "primary", then suggestions will be made as to what the
 *   answer could be, based on the value of that property.
 */
export class SearchRow implements BaseRow {
  /** The table to search through. */
  private readonly table: string;
  /** The property of the matching record to return. */
  private readonly take: string;
  /** 
   * If a property is put inside here, any questions to the user will disregard
   * this property, and apply to all records.
   */
  private readonly optional: string[];
  /**
   * If specified, create suggestions for the user, based on the value of this
   * property.
   */
  private readonly primary?: string;
  /**
   * The properties to match by.
   */
  private readonly matches: Record<string, BaseRow[]>;

  /**
   * Create a search operation.
   * @param table The table to search in.
   * @param take The property to take.
   * @param matches The properties to match by.
   * @param optional The properties to disregard when asking the user.
   * @param primary The property to generate suggestions from.
   */
  public constructor(table: string, take: string, matches: Record<string, BaseRow[]>, optional?: string[], primary?: string) {
    this.table = table;
    this.take = take;
    this.matches = matches;
    this.optional = optional ?? [];
    this.primary = primary;
  }

  run(_v: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const search = runner.references.get(this.table);

    const values: Record<string, string> = {};
    for (const [property, rows] of Object.entries(this.matches)) {
      const value = BaseRow.runMany(rows, row, runner, table);
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

    runner.asker.ask({
      hash: JSON.stringify([values, this.take]),
      table: this.table,
      unknown: this.take,
      known: values,
      optional: this.optional,
      suggestions: suggestions.slice(0, 3).map(s => (
        `**\`${s.value}\`** for *\`${s.key}\`*, in *${s.group}*.`
      )),
    });

    return null;
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
