import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export interface TrimRowData {
  type: "trim";
}

/** ------------------------------------------------------------------------- */

/**
 * Trim the whitespace off of the current value.
 */
export class TrimRow extends BaseRow {
  run(value: string): Maybe<string> {
    return value.trim();
  }

  buildJSON(): TrimRowData {
    return { type: "trim" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, TrimRowData> = z.strictObject({
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
