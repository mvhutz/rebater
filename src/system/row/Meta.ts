import { z } from "zod/v4";
import moment from "moment";
import path from "path";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

export const META_TYPE = z.enum(["quarter.lastday", "quarter.number", "row.source"]);
export type MetaType = z.infer<typeof META_TYPE>;

/**
 * Replace the current value with another value, pulled from the context of the
 * runner.
 * 
 * There are several types of values to extract:
 * - "quarter.lastday" returns the last day of the current quarter.
 * - "quarter.number" returns the number (1, 2, 3, 4) of the current quarter.
 * - "row.source" returns the name of the file that the current row is from.
 */
export class MetaRow implements BaseRow {
  /** The type of value to select. */
  public readonly value: MetaType;

  /**
   * Create a meta operation.
   * @param value The type of value to select.
   */
  public constructor(value: MetaType) {
    this.value = value;
  }

  run(value: string, row: Row, runner: Runner): Maybe<string> {
    switch (this.value) {
      case "quarter.lastday": return MetaRow.getQuarterLastDay(runner);
      case "quarter.number": return MetaRow.getQuarterNumber(runner);
      case "row.source": return MetaRow.getRowSource(row);
    }
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("meta"),
    value: META_TYPE
  }).transform(s => new MetaRow(s.value));

  static getQuarterLastDay(runner: Runner): string {
    const { year, quarter } = runner.settings.time;
    return moment().year(year).quarter(quarter).endOf("quarter").format("MM/DD/YYYY");
  }

  static getQuarterNumber(runner: Runner): string {
    return runner.settings.time.quarter.toString();
  }

  static getRowSource(row: Row) {
    return path.basename(row.source);
  }

  buildXML(from: XMLElement): void {
    from.element("meta", undefined, this.value);
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("meta",
    z.undefined(),
    z.tuple([makeTextElementSchema(META_TYPE)]))
    .transform(({ children: c }) => new MetaRow(c[0].text))
}
