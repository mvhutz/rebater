import { RowInput, RowOperator } from ".";
import { SubtractRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Subtract the current value, with the result of another set of row
 * transformations.
 */
export class SubtractRow implements RowOperator {
  /** The other set of row transformations. */
  private readonly other: RowOperator[];

  /**
   * Create a subtract operation.
   * @param other THe other set of row transformations.
   */
  public constructor(input: SubtractRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
  }

  run(input: RowInput): Maybe<string> {
    const other_value = RowOperator.runMany(this.other, input);
    return (Number(input.value) - Number(other_value)).toString();
  }
}
