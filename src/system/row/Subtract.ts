import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class SubtractRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("subtract"),
    with: z.lazy(() => z.array(ROW_SCHEMA))
  }).transform(s => new SubtractRow(s.with));

  private readonly other: BaseRow[];

  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const other_value = await runMany(this.other, row, runner);
    return (Number(value) - Number(other_value)).toString();
  }

  buildXML(from: XMLElement): void {
    const element = from.element("subtract");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("subtract",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new SubtractRow(x.children))
}
