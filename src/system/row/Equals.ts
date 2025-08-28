import { RowInput, RowOperator } from ".";
import { EqualsRowData } from "../../shared/transformer/advanced";
import { AdvancedTransformer } from "../transformer/AdvancedTransformer";

/** ------------------------------------------------------------------------- */

/**
 * Compare the current value with the value of anotehr set of row
 * transformations.
 * 
 * If they equal, this operation returns "true". Otherwise, it returns "false".
 */
export class EqualsRow implements RowOperator {
  /** The other set of row transformations. */
  private readonly other: RowOperator[];

  /**
   * Create an equals operation.
   * @param other The other set of row transformations.
   */
  public constructor(input: EqualsRowData) {
    this.other = input.with.map(AdvancedTransformer.parseRow);
  }

  run(input: RowInput): Maybe<string> {
    const other_value = RowOperator.runMany(this.other, input);
    return (input.value === other_value).toString();
  }
}
