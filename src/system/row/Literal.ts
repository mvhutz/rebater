import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class LiteralRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("literal"),
    value: z.coerce.string()
  }).transform(s => new LiteralRow(s.value));

  private readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  async run(): Promise<string> {
    return this.value;
  }

  buildXML(from: XMLElement): void {
    from.element("literal", undefined, this.value);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("literal",
    z.undefined(),
    z.tuple([makeTextElementSchema(z.string())]))
    .transform(({ children: c }) => new LiteralRow(c[0].text))
}
