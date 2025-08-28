import { RowInput, RowOperator } from ".";
import { CoerceUSDRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Attempt to coerce a string to a USD amount.
 */
export class CoerceUSDRow implements RowOperator {
  /** Which direction to round. */
  private readonly round: "up" | "down" | "default";

  /**
   * Create a coerce USD operation.
   * @param round Which direction to round.
   */
  public constructor(input: CoerceUSDRowData) {
    this.round = input.round;
  }

  run(input: RowInput): Maybe<string> {
    let value = Number(input.value);

    switch (this.round) {
      case "down": value = Math.floor(value * 100) / 100; break;
      case "up": value = Math.ceil(value * 100) / 100; break;
      default: break;
    }

    return value.toFixed(2);
  }
}
