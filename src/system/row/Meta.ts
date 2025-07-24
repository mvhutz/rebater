import { z } from "zod/v4";
import moment from "moment";
import { State } from "../information/State";
import path from "path";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export const META_TYPE = z.enum(["quarter.lastday", "quarter.number", "row.source"]);
export type MetaType = z.infer<typeof META_TYPE>;

export class MetaRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("meta"),
    value: META_TYPE
  }).transform(s => new MetaRow(s.value));

  private readonly value: MetaType;

  public constructor(value: MetaType) {
    this.value = value;
  }

  async run(_v: string, row: Row, state: State): Promise<string> {
    switch (this.value) {
      case "quarter.lastday": return MetaRow.getQuarterLastDay(state);
      case "quarter.number": return MetaRow.getQuarterNumber(state);
      case "row.source": return MetaRow.getRowSource(row);
    }
  }

  static getQuarterLastDay(state: State): string {
    const { year, quarter } = state.settings.getTime();
    return moment().year(year).quarter(quarter).endOf("quarter").format("MM/DD/YYYY");
  }

  static getQuarterNumber(state: State): string {
    return state.settings.getTime().quarter.toString();
  }

  static getRowSource(row: Row) {
    return path.basename(row.table.path);
  }
}
