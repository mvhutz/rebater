import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Get the absolute value of a value.
 */
export class AbsoluteRowOperator implements RowOperator {
  run(input: RowInput): Maybe<string> {
    return Math.abs(parseFloat(input.value)).toString();
  }
}
