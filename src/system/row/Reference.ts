import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface ReferenceRowData {
  type: "reference";
  table: string;
  match: string;
  take: string;
  group: string;
}

/** ------------------------------------------------------------------------- */

/**
 * Perform a lookup on a set of tabular data.
 * 
 * Given a reference table, this operation finds the first row whose "match" 
 * property matches the current value. Then, it returns the value of the "take"
 * property of that record.
 * 
 * It only searches records whose group matches those specified.
 * 
 * If no record is found, it returns null.
 */
export class ReferenceRow implements BaseRow {
  /** The reference table to look in. */
  private readonly table: string;
  /** The property to match. */
  private readonly match: string;
  /** The property to return. */
  private readonly take: string;
  /** The group of records to consider, within the table. */
  private readonly group: string;

  /**
   * Create a reference operation.
   * @param table The reference table to look in.
   * @param match The property to match.
   * @param take The property to return.
   * @param group The group of records to consider, within the table.
   */
  public constructor(table: string, match: string, take: string, group: string) {
    this.table = table;
    this.match = match;
    this.take = take;
    this.group = group;
  }

  /**
   * Turn a suggestion into a string.
   * @param s The suggestion data.
   * @returns The stringified suggestion.
   */
  private getSuggestionFormat(s: {
    key: string;
    value: string;
    group: string;
  }) {
    return `**\`${s.value}\`** for *\`${s.key}\`*, in *${s.group}*.`
  }

  /**
   * Create a question for the user, based on the given data.
   * @param value The value to ask for.
   * @returns 
   */
  private getQuestionFormat(value: string) {
    return `For *${this.group}*, what is the **\`${this.take}\`** of this **\`${this.table}\`**?\n\n *\`${value}\`*`;
  }

  run(value: string, row: Row, runner: Runner): Maybe<string> {
    const reference = runner.references.get(this.table);
    const view = reference.view(this.match);

    const result = view.ask({
      [this.match]: value,
      group: this.group,
    }, this.take);
    
    if (result != null) {
      return result;
    }

    const question = this.getQuestionFormat(value);
    const suggestions = reference.suggest(this.match, value, this.take);

    runner.emit("ask", {
      table: this.table,
      hash: question,
      // We only want to match the required property, and the group.
      known: {
        [this.match]: value,
        group: this.group,
      },
      // No properties are optional.
      optional: [],
      unknown: this.take,
      suggestions: suggestions.slice(0, 3).map(s => this.getSuggestionFormat(s)),
    });

    return null;
  }

  buildJSON(): ReferenceRowData {
    return { type: "reference", table: this.table, match: this.match, take: this.take, group: this.group };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, ReferenceRowData> = z.strictObject({
    type: z.literal("reference"),
    table: z.string(),
    match: z.string(),
    take: z.string(),
    group: z.string(),
  }).transform(s => new ReferenceRow(s.table, s.match, s.take, s.group));
}
