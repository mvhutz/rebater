import { RowInput, RowOperator } from ".";
import { SearchRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * A generalized version of `<reference>`.
 * 
 * Given a reference, it searches that table for a matching record.
 * 
 * To determine a match, it uses the "matches" object. For each [key, rows] in
 * "matches", it checks whether the value of the key in the record, matches the
 * resulting value generated from the set of row transformation. The first
 * record that matches all keys is chosen. The value of its "take" property is
 * returned.
 * 
 * When no record is found, it asks the user for input:
 * - If a property is "optional", then the question will be directed for all
 *   records, not just those with the specific value of this property.
 * - If a property is "primary", then suggestions will be made as to what the
 *   answer could be, based on the value of that property.
 */
export class SearchRow implements RowOperator {
  /** The table to search through. */
  private readonly table: string;
  /** The property of the matching record to return. */
  private readonly take: string;
  /** 
   * If a property is put inside here, any questions to the user will disregard
   * this property, and apply to all records.
   */
  private readonly optional: string[];
  /**
   * If specified, create suggestions for the user, based on the value of this
   * property.
   */
  private readonly primary?: string;
  /**
   * The properties to match by.
   */
  private readonly matches: Record<string, RowOperator[]>;

  /**
   * Create a search operation.
   * @param table The table to search in.
   * @param take The property to take.
   * @param matches The properties to match by.
   * @param optional The properties to disregard when asking the user.
   * @param primary The property to generate suggestions from.
   */
  public constructor(input: SearchRowData) {
    const matches_entries = Object.entries(input.matches ?? []);
    const definitions = Object.fromEntries(matches_entries.map(m => m[1].definition));
    const primary = matches_entries.filter(o => o[1].primary).map(o => o[0]);
    const optional = matches_entries.filter(o => o[1].optional).map(o => o[0]);

    this.table = input.table;
    this.take = input.take;
    this.matches = definitions;
    this.optional = optional;
    this.primary = primary[0];
  }

  run(input: RowInput): Maybe<string> {
    const search = input.state.references.getTable(this.table);
    const view = this.primary == null ? search : search.view(this.primary);

    const values: Record<string, string> = {};
    for (const [property, rows] of Object.entries(this.matches)) {
      const value = RowOperator.runMany(rows, input);
      if (value == null) return null;

      values[property] = value;
    }

    const result = view.ask(values, this.take);
    if (result != null) {
      return result;
    }

    let suggestions: { key: string; value: string; group: string; }[] = [];
    if (this.primary) {
      suggestions = search.suggest(this.primary, values[this.primary], this.take);
    }

    input.state.tracker.ask({
      hash: JSON.stringify([values, this.take]),
      table: this.table,
      unknown: this.take,
      known: values,
      optional: this.optional,
      suggestions: suggestions.slice(0, 3).map(s => (
        `**\`${s.value}\`** for *\`${s.key}\`*, in *${s.group}*.`
      )),
    });

    return null;
  }
}
