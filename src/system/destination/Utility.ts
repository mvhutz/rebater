import Papa from "papaparse";
import { DestinationInput, DestinationOperator } from ".";
import { ReferenceFile, ReferenceSchema } from "../information/items/ReferenceFile";
import { UtilityDestinationData } from "../../shared/transformer/advanced";

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
    const filepath = input.runner.settings.getUtilityPath(this.name);
    const utility = new ReferenceFile(filepath, this.name, {
      group: this.name,
      quarter: input.runner.settings.time
    });

    utility.push(reference_data);
    input.runner.utilities.add(utility);
  }
}
