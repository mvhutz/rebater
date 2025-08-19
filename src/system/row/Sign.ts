import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export interface SignumRowData {
  type: "sign";
}

/** ------------------------------------------------------------------------- */

/**
 * Get the sign of the current value.
 */
export class SignumRow implements BaseRow {
  run(value: string): Maybe<string> {
    return Math.sign(parseFloat(value)).toString();
  }

  buildJSON(): SignumRowData {
    return { type: "sign" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, SignumRowData> = z.strictObject({
    type: z.literal("sign"),
  }).transform(() => new SignumRow());

  buildXML(from: XMLElement): void {
    from.element("sign");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("sign", 
    z.undefined(),
    z.undefined())
    .transform(() => new SignumRow())
}
