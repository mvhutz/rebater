import Papa from "papaparse";
import { z } from "zod/v4";
import { State } from "../information/State";
import { BaseDestination } from ".";
import { Destination } from "../information/destination/Destination";
import { RebateSchema } from "../../shared/worker/response";

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
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const rebates = z.array(RebateSchema).parse(raw);

    const destination = new Destination(this.name, state.settings.time, this.getDestinationFile(state));
    destination.append(rebates);
    state.destinations.add(destination);
  }
}
