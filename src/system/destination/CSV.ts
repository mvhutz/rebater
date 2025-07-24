import { unparse } from "papaparse";
import { z } from "zod/v4";
import { State } from "../information/State";
import { BaseDestination } from ".";

/** ------------------------------------------------------------------------- */

export class CSVDestination implements BaseDestination {

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("csv"),
    name: z.string(),
  }).transform(s => new CSVDestination(s.name));

  private name: string;

  public constructor(name: string) {
    this.name = name;
  }

  getDestinationFile(state: State): string {
    return state.settings.getDestinationPath(this.name);
  }

  run(table: Table, state: State): void {
    const data = table.data.map(row => row.data);
    const buffer = Buffer.from(unparse(data));

    state.appendDestinationFile(this.getDestinationFile(state), buffer);
  }
}
