import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Get the sign of the current value.
 */
export class SignumRow implements RowOperator {
  run(input: RowInput): Maybe<string> {
    return Math.sign(parseFloat(input.value)).toString();
  }
}
