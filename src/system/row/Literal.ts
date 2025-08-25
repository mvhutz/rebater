import { RowOperator } from ".";
import { LiteralRowData } from "../../shared/transformer/advanced";

/** ------------------------------------------------------------------------- */

/**
 * Replace the current value with another.
 */
export class LiteralRow implements RowOperator {
  /** The replacement value. */
  private readonly value: string;

  /**
   * Create a literal operation.
   * @param value The replacement value.
   */
  public constructor(input: LiteralRowData) {
    this.value = input.value;
  }

  run(): string {
    return this.value;
  }
}
