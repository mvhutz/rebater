import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export interface CoerceNumberRowData {
  type: "coerce";
  as: "number";
  otherwise?: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Attempt to coerce a number from a string.
 */
export class CoerceNumberRow implements BaseRow {
  /** If the value cannot be converted, replace it with this value. */
  private readonly otherwise?: string;

  /**
   * Create a coerce number operation.
   * @param otherwise If the value cannot be converted, replace it with this value.
   */
  public constructor(otherwise?: string) {
    this.otherwise = otherwise;
  }

  run(value: string): Maybe<string> {
    const float = parseFloat(value);

    if (isNaN(float) && this.otherwise != null) {
      return this.otherwise;
    } else {
      return float.toString();
    }
  }
  
  buildJSON(): CoerceNumberRowData {
    return {
      type: "coerce",
      as: "number",
      otherwise: this.otherwise,
    }
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, CoerceNumberRowData> = z.strictObject({
    type: z.literal("coerce"),
    as: z.literal("number"),
    otherwise: z.string().optional(),
  }).transform(s => new CoerceNumberRow(s.otherwise));

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
