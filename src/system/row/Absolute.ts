import assert from "assert";
import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Get the absolute value of a value.
 */
export class AbsoluteRowOperator implements RowOperator {
  run(input: RowInput): string {
    const num = parseFloat(input.value);
    assert.ok(!isNaN(num), `Value '${num.toString()}' is not a number.`);

    return Math.abs(num).toString();
  }
}
