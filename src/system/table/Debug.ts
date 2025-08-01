import { z } from "zod/v4";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { UtilityDestination } from "../destination/Utility";
import path from "path";

/** ------------------------------------------------------------------------- */

export class DebugTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("debug"),
    name: z.string().default("default"),
  }).transform(s => new DebugTable(s.name));

  private readonly name: string;

  public constructor(name: string) {
    this.name = name;
  }

  async run(table: Table, runner: Runner): Promise<Table> {
    const true_name = `debug/${this.name}/${path.parse(table.path).name}`;
    const utility = new UtilityDestination(true_name);
    utility.run(table, runner);
    return table;
  }

  buildXML(from: XMLElement): void {
    from.element("debug", undefined, this.name);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("debug",
    z.undefined(),
    z.tuple([
      makeTextElementSchema(z.string())
    ]))
    .transform(({ children: c }) => new DebugTable(c[0].text));
}
