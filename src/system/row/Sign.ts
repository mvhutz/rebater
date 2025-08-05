import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class SignumRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("abs"),
  }).transform(() => new SignumRow());

  async run(value: string): Promise<string> {
    return Math.sign(parseFloat(value)).toString();
  }

  buildXML(from: XMLElement): void {
    from.element("abs");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("sign", 
    z.undefined(),
    z.undefined())
    .transform(() => new SignumRow())
}
