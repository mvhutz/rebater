import { z } from "zod/v4";
import { State } from "../information/State";
import { CSVDestination } from "../destination/CSV";
import { BaseTable } from ".";

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

  async run(table: Table, state: State): Promise<Table> {
    this.destination.run(table, state);
    return table;
  }
}
