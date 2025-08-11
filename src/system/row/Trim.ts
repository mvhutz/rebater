import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Trim the whitespace off of the current value.
 */
export class TrimRow implements BaseRow {
  run(value: string): Maybe<string> {
    return value.trim();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("trim"),
  }).transform(() => new TrimRow());

  buildXML(from: XMLElement): void {
    from.element("trim");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("trim", 
    z.undefined(),
    z.undefined())
    .transform(() => new TrimRow())
}
