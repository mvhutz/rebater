import assert from "assert";
import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Get the sign of the current value.
 */
export class SignumRow implements RowOperator {
  run(input: RowInput): string {
    const num = parseFloat(input.value);
    assert.ok(!isNaN(num), `Value '${input.value}' is not a number!`);

    return Math.sign(num).toString();
  }
}
