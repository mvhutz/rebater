import { RowInput, RowOperator } from ".";
import { ConcatRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Concatenate one string with the value from another set of row
 * transformations.
 * 
 * Optionally, you can set a separator value to go in-between the two values.
 */
export class ConcatRow implements RowOperator {
  /** The set of row transformations to extract the second value. */
  private readonly other: RowOperator[];
  /** The separator between the two values. */
  private readonly separator: string;

  /**
   * Create a concat operation.
   * @param other The set of row transformations to extract the second value.
   * @param separator The separator between the two values.
   */
  public constructor(input: ConcatRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
    this.separator = input.separator;
  }

  run(input: RowInput): string {
    const other_value = RowOperator.runManyUnsafe(this.other, input);
    return input.value + this.separator + other_value;
  }
}
