import { z } from "zod/v4";
import { BaseTable } from ".";
import { rewire } from "../util";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class TrimTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("trim"),
    top: z.number().optional(),
    bottom: z.number().optional(),
  }).transform(s => new TrimTable(s.top, s.bottom));

  private readonly top?: number;
  private readonly bottom?: number;

  public constructor(top?: number, bottom?: number) {
    this.top = top == null ? undefined : top;
    this.bottom = bottom == null ? undefined : -bottom;
  }

  async run(table: Table): Promise<Table> {
    table.data = table.data.slice(this.top, this.bottom);
    return rewire(table);
  }

  buildXML(from: XMLElement): void {
    from.element("trim", {
      top: this.top,
      bottom: this.bottom == null ? undefined : -this.bottom
    })
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("trim",
    z.strictObject({
      top: z.coerce.number().optional(),
      bottom: z.coerce.number().optional(),
    }),
    z.undefined())
    .transform(({ attributes: a }) => new TrimTable(a.top, a.bottom));
}

