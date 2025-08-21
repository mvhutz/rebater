import Papa from "papaparse";
import { z } from "zod/v4";
import { BaseDestination } from ".";
import { Runner } from "../runner/Runner";
import { ReferenceFile, ReferenceSchema } from "../information/items/ReferenceFile";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface UtilityDestinationData {
  type: "utility";
  name: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Convert the table to a "utility". This can be referenced in future transformers
 * using the `<utility>` row operation.
 */
export class UtilityDestination implements BaseDestination {
  public readonly name: string;

  public constructor(name: string) {
    this.name = name;
  }

  run(table: Table, runner: Runner): void {
    // Convert to a reference.
    const data = table.split().map(row => row.split());
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const reference_data = ReferenceSchema.parse(raw);

    // Send to the Utility store.
    const filepath = runner.settings.getUtilityPath(this.name);
    const utility = new ReferenceFile(filepath, this.name, {
      group: this.name,
      quarter: runner.settings.time
    });

    utility.push(reference_data);
    runner.utilities.add(utility);
  }

  buildJSON(): UtilityDestinationData {
    return { type: "utility", name: this.name };
  }

  public static readonly SCHEMA: z.ZodType<BaseDestination, UtilityDestinationData> = z.strictObject({
    type: z.literal("utility"),
    name: z.string(),
  }).transform(s => new UtilityDestination(s.name));
}
