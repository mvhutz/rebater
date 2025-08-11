import { z } from "zod/v4";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { UtilityDestination } from "../destination/Utility";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * A utility operation, that prints any table that goes through it.
 */
export class DebugTable implements BaseTable {
  /** The name of the file that table sohuld be printed to. */
  private readonly name: string;

  /**
   * Create a debug operation.
   * @param name The name of the file that table sohuld be printed to.
   */
  public constructor(name: string) {
    this.name = name;
  }

  run(table: Table, runner: Runner): Table {
    // The debug table is stored as a utility, under the `debug` folder.
    const true_name = `debug/${this.name}/${crypto.randomUUID()}`;
    const utility = new UtilityDestination(true_name);
    utility.run(table, runner);
    return table;
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("debug"),
    name: z.string().default("default"),
  }).transform(s => new DebugTable(s.name));

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
