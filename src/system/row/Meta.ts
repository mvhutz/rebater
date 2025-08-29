import moment from "moment";
import path from "path";
import { RowInput, RowOperator } from ".";
import { MetaRowData, MetaType } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Replace the current value with another value, pulled from the context of the
 * runner.
 * 
 * There are several types of values to extract:
 * - "quarter.lastday" returns the last day of the current quarter.
 * - "quarter.number" returns the number (1, 2, 3, 4) of the current quarter.
 * - "row.source" returns the name of the file that the current row is from.
 */
export class MetaRow implements RowOperator {
  /** The type of value to select. */
  public readonly value: MetaType;

  /**
   * Create a meta operation.
   * @param value The type of value to select.
   */
  public constructor(input: MetaRowData) {
    this.value = input.value;
  }

  run(input: RowInput): Maybe<string> {
    switch (this.value) {
      case "quarter.lastday": return MetaRow.getQuarterLastDay(input);
      case "quarter.number": return MetaRow.getQuarterNumber(input);
      case "row.source": return MetaRow.getRowSource(input);
    }
  }

  static getQuarterLastDay(input: RowInput): string {
    const { year, quarter } = input.context.time;
    return moment().year(year).quarter(quarter).endOf("quarter").format("MM/DD/YYYY");
  }

  static getQuarterNumber(input: RowInput): string {
    return input.context.time.quarter.toString();
  }

  static getRowSource(input: RowInput) {
    return path.basename(input.row.source);
  }
}
