import Papa from "papaparse";
import { z } from "zod/v4";
import { BaseDestination } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import { CSVRebateFile } from "../information/RebateFile";
import { XMLElement } from "xmlbuilder";

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

  run(table: Table, runner: Runner): void {
    const data = table.data.map(row => row.data);
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const rebates = z.array(RebateSchema).parse(raw);

    const filepath = runner.settings.getDestinationPath(this.name);
    const destination = new CSVRebateFile(filepath, {
      group: this.name,
      quarter: runner.settings.time
    });

    destination.push(rebates);
    runner.destinations.add(destination);
  }

  build(from: XMLElement): void {
    from.element("excel", {
      group: this.name
    });
  }
}
