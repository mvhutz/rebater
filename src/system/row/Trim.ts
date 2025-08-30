import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Trim the whitespace off of the current value.
 */
export class TrimRow implements RowOperator {
  run(input: RowInput): string {
    return input.value.trim();
  }
}
