import { z } from "zod/v4";
import moment from "moment";
import path from "path";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export const META_TYPE = z.enum(["quarter.lastday", "quarter.number", "row.source"]);
export type MetaType = z.infer<typeof META_TYPE>;

export class MetaRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("meta"),
    value: META_TYPE
  }).transform(s => new MetaRow(s.value));

  public readonly value: MetaType;

  public constructor(value: MetaType) {
    this.value = value;
  }

  async run(_v: string, row: Row, runner: Runner): Promise<string> {
    switch (this.value) {
      case "quarter.lastday": return MetaRow.getQuarterLastDay(runner);
      case "quarter.number": return MetaRow.getQuarterNumber(runner);
      case "row.source": return MetaRow.getRowSource(row);
    }
  }

  static getQuarterLastDay(runner: Runner): string {
    const { year, quarter } = runner.settings.getTime();
    return moment().year(year).quarter(quarter).endOf("quarter").format("MM/DD/YYYY");
  }

  static getQuarterNumber(runner: Runner): string {
    return runner.settings.getTime().quarter.toString();
  }

  static getRowSource(row: Row) {
    return path.basename(row.table.path);
  }

  buildXML(from: XMLElement): void {
    from.element("meta", undefined, this.value);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("meta",
    z.undefined(),
    z.tuple([makeTextElementSchema(META_TYPE)]))
    .transform(({ children: c }) => new MetaRow(c[0].text))
}
