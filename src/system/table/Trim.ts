import { z } from "zod/v4";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface TrimTableData {
  type: "trim";
  top?: number;
  bottom?: number;
}

/** ------------------------------------------------------------------------- */

/**
 * Trim rows on the top or bottom of a table.
 */
export class TrimTable implements BaseTable {
  /** How many rows to remove from the top of the table. */
  private readonly top?: number;
  /** How many rows to remove from the bottom of the table. */
  private readonly bottom?: number;

  /**
   * Create a trim operation.
   * @param top How many rows to remove from the top of the table.
   * @param bottom How many rows to remove from the bottom of the table.
   */
  public constructor(top?: number, bottom?: number) {
    this.top = top == null ? undefined : top;
    this.bottom = bottom == null ? undefined : -bottom;
  }

  run(table: Table): Table {
    return table.slice(this.top, this.bottom);
  }

  buildJSON(): TrimTableData {
    return { type: "trim", top: this.top, bottom: this.bottom };
  }

  public static readonly SCHEMA: z.ZodType<BaseTable, TrimTableData> = z.strictObject({
    type: z.literal("trim"),
    top: z.number().optional(),
    bottom: z.number().optional(),
  }).transform(s => new TrimTable(s.top, s.bottom));

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

