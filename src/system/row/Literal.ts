import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Replace the current value with another.
 */
export class LiteralRow implements BaseRow {
  /** The replacement value. */
  private readonly value: string;

  /**
   * Create a literal operation.
   * @param value The replacement value.
   */
  public constructor(value: string) {
    this.value = value;
  }

  run(): string {
    return this.value;
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("literal"),
    value: z.coerce.string()
  }).transform(s => new LiteralRow(s.value));

  buildXML(from: XMLElement): void {
    from.element("literal", undefined, this.value);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("literal",
    z.undefined(),
    z.tuple([makeTextElementSchema(z.string())]))
    .transform(({ children: c }) => new LiteralRow(c[0].text))
}
