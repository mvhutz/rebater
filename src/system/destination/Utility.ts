import Papa from "papaparse";
import { z } from "zod/v4";
import { BaseDestination } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { ReferenceFile, ReferenceSchema } from "../information/items/ReferenceFile";

/** ------------------------------------------------------------------------- */

export class UtilityDestination implements BaseDestination {

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("utility"),
    name: z.string(),
  }).transform(s => new UtilityDestination(s.name));

  public readonly name: string;

  public constructor(name: string) {
    this.name = name;
  }

  run(table: Table, runner: Runner): void {
    const data = table.data.map(row => row.data);
    const { data: raw } = Papa.parse(Papa.unparse(data), { header: true });
    const reference_data = ReferenceSchema.parse(raw);

    const filepath = runner.settings.getUtilityPath(this.name);
    const utility = new ReferenceFile(filepath, this.name, {
      group: this.name,
      quarter: runner.settings.time
    });

    utility.push(reference_data);
    runner.utilities.add(utility);
  }

  buildXML(from: XMLElement): void {
    from.element("utility", undefined, this.name);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("utility",
    z.undefined(),
    z.tuple([
      makeTextElementSchema(z.string())
    ]))
    .transform(({ children: c }) => new UtilityDestination(c[0].text))
}
