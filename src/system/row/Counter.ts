import { RowInput, RowOperator } from ".";

/** ------------------------------------------------------------------------- */

/**
 * Extract the value of a certain counter.
 */
export class CounterRow implements RowOperator {
  run(input: RowInput): Maybe<string> {
    return input.runner.counter.getThenIncrement("counter").toString();
  }
}
