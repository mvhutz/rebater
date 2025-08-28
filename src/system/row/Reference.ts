import { RowInput, RowOperator } from ".";
import { ReferenceRowData } from "../../shared/transformer/advanced";

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
export class ReferenceRow implements RowOperator {
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
  public constructor(input: ReferenceRowData) {
    this.table = input.table;
    this.match = input.match;
    this.take = input.take;
    this.group = input.group;
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

  run(input: RowInput): Maybe<string> {
    const reference = input.state.references.getTable(this.table);
    const view = reference.view(this.match);

    const result = view.ask({
      [this.match]: input.value,
      group: this.group,
    }, this.take);
    
    if (result != null) {
      return result;
    }

    const question = this.getQuestionFormat(input.value);
    if (input.state.tracker.has(question)) return null;

    const suggestions = reference.suggest(this.match, input.value, this.take);
    input.state.tracker.markAsk({
      table: this.table,
      hash: question,
      // We only want to match the required property, and the group.
      known: {
        [this.match]: input.value,
        group: this.group,
      },
      // No properties are optional.
      optional: [],
      unknown: this.take,
      suggestions: suggestions.slice(0, 3).map(s => this.getSuggestionFormat(s)),
    });

    return null;
  }
}
