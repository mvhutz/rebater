import assert from "assert";
import { RowInput, RowOperator } from ".";
import { AddRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Add another value to the current value, based on another set of row
 * transformations.
 */
export class AddRowOperator implements RowOperator {
  /** The other row transformations, whose result will be added. */
  private readonly other: RowOperator[];

  /**
   * Create an add operation.
   * @param other The other row transformations, whose result will be added.
   */
  public constructor(input: AddRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
  }

  run(input: RowInput): string {
    const other_value = RowOperator.runManyUnsafe(this.other, input);
    const result = Number(input.value) + Number(other_value);
    assert.ok(!isNaN(result), `Sum of '${other_value}' and '${input.value}' is not a number!`);

    return (Number(input.value) + Number(other_value)).toString();
  }
}
