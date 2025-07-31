import Papa from "papaparse";
import { z } from "zod/v4";
import { BaseDestination } from ".";
import { RebateSchema } from "../../shared/worker/response";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { CSVRebateFile } from "../information/items/CSVRebateFile";

/** ------------------------------------------------------------------------- */

export class RebateDestination implements BaseDestination {

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("rebate"),
    name: z.string(),
  }).transform(s => new RebateDestination(s.name));

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

  buildXML(from: XMLElement): void {
    from.element("rebate", undefined, this.name);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("rebate",
    z.undefined(),
    z.tuple([
      makeTextElementSchema(z.string())
    ]))
    .transform(({ children: c }) => new RebateDestination(c[0].text))
}
