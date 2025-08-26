import Papa from "papaparse";
import { DestinationInput, DestinationOperator } from ".";
import { UtilityDestinationData } from "../../shared/transformer/advanced";
import { ReferenceSchema } from "../../shared/state/items/ReferenceFile";
import { UtilityFile } from "../../shared/state/stores/UtilityStore";

/** ------------------------------------------------------------------------- */

/**
 * Convert the table to a "utility". This can be referenced in future transformers
 * using the `<utility>` row operation.
 */
export class UtilityDestinationOperator implements DestinationOperator {
  public readonly name: string;

  public constructor(input: UtilityDestinationData) {
    this.name = input.name;
  }

  run(input: DestinationInput): void {
    // Convert to a reference.
    const data = input.table.split().map(row => row.split());
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const reference_data = ReferenceSchema.parse(raw);

    // Send to the Utility store.
    const filepath = input.state.settings.getUtilityPath(this.name);
    const utility = new UtilityFile(filepath, this.name, {
      quarter: input.state.settings.time
    });

    utility.push(reference_data);
    input.state.utilities.add(utility);
  }
}
