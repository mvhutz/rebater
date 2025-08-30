import assert from "assert";
import { RowInput, RowOperator } from ".";
import { MultiplyRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Multiply the current value with the result of anotehr set of row transformations.
 */
export class MultiplyRow implements RowOperator {
  /** The set of row transformations. */
  private readonly other: RowOperator[];

  /**
   * Create a multiply operation.
   * @param other The set of row transformations.
   */
  public constructor(input: MultiplyRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
  }

  run(input: RowInput): string {
    const other_value = RowOperator.runManyUnsafe(this.other, input);
    const result = Number(input.value) * Number(other_value);
    assert.ok(!isNaN(result), `Mulitplication of '${other_value}' and '${input.value}' is not a number!`);
    
    return result.toString();
  }
}
