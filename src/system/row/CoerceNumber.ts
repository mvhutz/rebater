import { RowInput, RowOperator } from ".";
import { CoerceNumberRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Attempt to coerce a number from a string.
 */
export class CoerceNumberRow implements RowOperator {
  /** If the value cannot be converted, replace it with this value. */
  private readonly otherwise?: string;

  /**
   * Create a coerce number operation.
   * @param otherwise If the value cannot be converted, replace it with this value.
   */
  public constructor(input: CoerceNumberRowData) {
    this.otherwise = input.otherwise;
  }

  run(input: RowInput): Maybe<string> {
    const float = parseFloat(input.value);

    if (isNaN(float) && this.otherwise != null) {
      return this.otherwise;
    } else {
      return float.toString();
    }
  }
}
