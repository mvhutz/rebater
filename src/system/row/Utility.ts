import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import assert from "assert";

/** ------------------------------------------------------------------------- */

export class UtilityRow implements BaseRow {
  private readonly table: string;
  private readonly match: string;
  private readonly take: string;
  private readonly group: string;

  public constructor(table: string, match: string, take: string, group: string) {
    this.table = table;
    this.match = match;
    this.take = take;
    this.group = group;
  }

  async run(value: string, row: Row, runner: Runner): Promise<Maybe<string>> {
    const utility = runner.utilities.get(this.table);
    const result = utility.ask(this.match, value, this.take, this.group);
    assert.ok(result != null, `Table '${this.table}' has no '${this.match}' for '${value}'.`);
    
    return result;
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("utility"),
    table: z.string(),
    match: z.string(),
    take: z.string(),
    group: z.string(),
  }).transform(s => new UtilityRow(s.table, s.match, s.take, s.group));

  buildXML(from: XMLElement): void {
    from.element("utility", {
      table: this.table,
      match: this.match,
      take: this.take,
      group: this.group,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("utility",
    z.strictObject({
      table: z.string(),
      match: z.string(),
      take: z.string(),
      group: z.string(),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new UtilityRow(a.table, a.match, a.take, a.group))
}
