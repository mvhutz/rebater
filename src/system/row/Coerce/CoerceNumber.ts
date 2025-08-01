import { z } from "zod/v4";
import { BaseRow } from "..";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../../xml";

/** ------------------------------------------------------------------------- */

export class CoerceNumberRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("coerce"),
    as: z.literal("number"),
    otherwise: z.string().optional(),
  }).transform(s => new CoerceNumberRow(s.otherwise));

  private readonly otherwise?: string;

  public constructor(otherwise?: string) {
    this.otherwise = otherwise;
  }

  async run(value: string): Promise<string> {
    const float = parseFloat(value);

    if (isNaN(float) && this.otherwise != null) {
      return this.otherwise;
    } else {
      return float.toString();
    }
  }

  buildXML(from: XMLElement): void {
    from.element("coerce", {
      as: "number",
      otherwise: this.otherwise,
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("coerce",
    z.strictObject({
      as: z.literal("number"),
      otherwise: z.string().optional(),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new CoerceNumberRow(a.otherwise))
}
