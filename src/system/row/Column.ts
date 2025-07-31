import { z } from "zod/v4";
import { ExcelIndexSchema, getExcelFromIndex } from "../util";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { LiteralRow } from "./Literal";

/** ------------------------------------------------------------------------- */

export class ColumnRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("column"),
    index: ExcelIndexSchema
  }).transform(s => new ColumnRow(s.index));

  private readonly index: number;

  public constructor(index: number) {
    this.index = index;
  }

  async run(_v: string, row: Row): Promise<string> {
    return row.data[this.index];
  }

  buildXML(from: XMLElement): void {
    from.element("column", undefined, getExcelFromIndex(this.index));
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("column",
    z.undefined(),
    z.tuple([makeTextElementSchema(z.string())]))
    .transform(({ children: c }) => new LiteralRow(c[0].text))
}
