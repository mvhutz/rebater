import Papa from "papaparse";
import { z, ZodType } from "zod/v4";
import { BaseDestination } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import { CSVRebateFile } from "../information/items/CSVRebateFile";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface RebateDestinationData {
  type: "rebate"
  name: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Send a table to the `rebates` folder, as a CSV.
 */
export class RebateDestination implements BaseDestination {
  private name: string;

  public constructor(name: string) {
    this.name = name;
  }

  run(table: Table, runner: Runner): void {
    // Convert to a list of Rebates.
    const data = table.split().map(row => row.split());
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const rebates = z.array(RebateSchema).parse(raw);

    // Send to the destination store.
    const filepath = runner.settings.getDestinationPath(this.name);
    const destination = new CSVRebateFile(filepath, {
      group: this.name,
      quarter: runner.settings.time
    });

    destination.push(rebates);
    runner.destinations.add(destination);
  }

  buildJSON(): RebateDestinationData {
    return { type: "rebate", name: this.name };
  }

  public static readonly SCHEMA: ZodType<BaseDestination, RebateDestinationData> = z.strictObject({
    type: z.literal("rebate"),
    name: z.string(),
  }).transform(s => new RebateDestination(s.name));
}
