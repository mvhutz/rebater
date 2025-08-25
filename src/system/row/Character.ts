import { RowInput, RowOperator } from ".";
import { CharacterRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Filter out certain characters from a string.
 * 
 * This operation selects all characters in a value that exists in a specified
 * string. Then it either chooses to discard those characters, or keep only
 * those, and discard the rest.
 */
export class CharacterRow implements RowOperator {
  /** The set of characters to match for. */
  private readonly select: string;
  /** Whether the keep or drop the matching characters. */
  private readonly action: "keep" | "drop";

  /**
   * Create a character operation.
   * @param select The set of characters to match for.
   * @param action Whether the keep or drop the matching characters.
   */
  public constructor(input: CharacterRowData) {
    this.select = input.select;
    this.action = input.action;
  }

  run(input: RowInput): Maybe<string> {
    const characters = input.value.split("");
    return characters
      .filter(c => this.select.includes(c) === (this.action === "keep"))
      .join("");
  }
}
