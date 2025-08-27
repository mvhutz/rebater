import Papa from "papaparse";
import { DestinationInput, DestinationOperator } from ".";
import { UtilityDestinationData } from "../../shared/transformer/advanced";
import { ReferenceSchema } from "../../shared/state/stores/ReferenceStore";
import { good } from "../../shared/reply";

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

  async run(input: DestinationInput): Promise<void> {
    // Convert to a reference.
    const data = input.table.split().map(row => row.split());
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const reference_data = ReferenceSchema.parse(raw);

    await input.state.utilities.push({
      item: { name: this.name, path: `${this.name}.csv` },
      data: good(reference_data)
    });
  }
}
