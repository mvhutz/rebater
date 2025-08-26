import Papa from "papaparse";
import { z } from "zod/v4";
import { DestinationInput, DestinationOperator } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { RebateDestinationData } from "../../shared/transformer/advanced";
import { DestinationFile } from "../../shared/state/stores/DestinationStore";

/** ------------------------------------------------------------------------- */

/**
 * Send a table to the `rebates` folder, as a CSV.
 */
export class RebateDestinationOperator implements DestinationOperator {
  private name: string;

  public constructor(input: RebateDestinationData) {
    this.name = input.name;
  }

  run(input: DestinationInput): void {
    // Convert to a list of Rebates.
    const data = input.table.split().map(row => row.split());
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const rebates = z.array(RebateSchema).parse(raw);

    // Send to the destination store.
    const filepath = input.state.settings.getDestinationPath(this.name);
    const destination = new DestinationFile(filepath, {
      group: this.name,
      quarter: input.state.settings.time
    });

    destination.push(rebates);
    input.state.destinations.add(destination);
  }
}
