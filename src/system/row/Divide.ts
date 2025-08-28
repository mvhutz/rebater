import { RowInput, RowOperator } from ".";
import { DivideRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Divide the current value with the result of anotehr set of row transformations.
 */
export class DivideRow implements RowOperator {
  /** The set of row transformations. */
  private readonly other: RowOperator[];

  /**
   * Create a divide operation.
   * @param other The set of row transformations.
   */
  public constructor(input: DivideRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
  }

  run(input: RowInput): Maybe<string> {
    const other_value = RowOperator.runMany(this.other, input);
    return (Number(input.value) / Number(other_value)).toString();
  }
}
