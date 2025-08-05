import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class AbsoluteRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("abs"),
  }).transform(() => new AbsoluteRow());

  async run(value: string): Promise<string> {
    return Math.abs(parseFloat(value)).toString();
  }

  buildXML(from: XMLElement): void {
    from.element("abs");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("abs", 
    z.undefined(),
    z.undefined())
    .transform(() => new AbsoluteRow())
}
