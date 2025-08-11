import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Get the sign of the current value.
 */
export class SignumRow implements BaseRow {
  run(value: string): Maybe<string> {
    return Math.sign(parseFloat(value)).toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("abs"),
  }).transform(() => new SignumRow());

  buildXML(from: XMLElement): void {
    from.element("abs");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("sign", 
    z.undefined(),
    z.undefined())
    .transform(() => new SignumRow())
}
