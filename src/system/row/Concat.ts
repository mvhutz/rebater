import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class ConcatRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("concat"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
    separator: z.string().default("")
  }).transform(s => new ConcatRow(s.with, s.separator));

  private readonly other: BaseRow[];
  private readonly separator: string;

  public constructor(other: BaseRow[], separator: string) {
    this.other = other;
    this.separator = separator;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const other_value = await runMany(this.other, row, runner);
    return other_value + this.separator + value;
  }

  buildXML(from: XMLElement): void {
    const element = from.element("concat");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("concat",
    z.strictObject({
      separator: z.string().default("")
    }),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new ConcatRow(x.children, x.attributes.separator))
}
