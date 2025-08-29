import Papa from "papaparse";
import { z } from "zod/v4";
import { DestinationInput, DestinationOperator } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { RebateDestinationData } from "../../shared/transformer/advanced";
import { good } from "../../shared/reply";

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

    if (rebates.length === 0) {
      console.log("NO DATA", this.name);
      return;
    }
    
    // Send to the destination store.
    input.state.destinations.mark({
      item: {
        quarter: input.context.time,
        name: `${this.name}.csv`
      },
      data: good(rebates)
    });
  }
}
