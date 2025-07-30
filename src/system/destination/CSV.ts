import Papa from "papaparse";
import { z } from "zod/v4";
import { BaseDestination } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import { Destination } from "../information/DestinationStore";

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

  private getDestinationFile(runner: Runner): string {
    return runner.settings.getDestinationPath(this.name);
  }

  run(table: Table, runner: Runner): void {
    const data = table.data.map(row => row.data);
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const rebates = z.array(RebateSchema).parse(raw);

    const destination = new Destination(this.name, runner.settings.time, this.getDestinationFile(runner));
    destination.push(rebates);
    runner.destinations.add(destination);
  }
}
