import { z } from "zod/v4";
import { CSVDestination } from "../destination/CSV";
import { BaseTable } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class DebugTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("debug"),
    name: z.string().default("default"),
  }).transform(s => new DebugTable(s.name));

  private readonly destination: CSVDestination;

  public constructor(name: string) {
    this.destination = new CSVDestination(name);
  }

  async run(table: Table, runner: Runner): Promise<Table> {
    this.destination.run(table, runner);
    return table;
  }

  buildXML(from: XMLElement): void {
    from.element("debug");
  }
}
