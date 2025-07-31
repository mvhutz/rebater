import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class TrimRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("trim"),
  }).transform(() => new TrimRow());

  async run(value: string): Promise<string> {
    return value.trim();
  }

  buildXML(from: XMLElement): void {
    from.element("trim");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("trim", 
    z.undefined(),
    z.undefined())
    .transform(() => new TrimRow())
}
