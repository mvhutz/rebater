import { Row, Table } from "../information/Table";
import { State } from "../../shared/state";

/** ------------------------------------------------------------------------- */

export interface RowInput {
  value: string;
  row: Row;
  state: State;
  table: Table;
}

/**
 * A row operation.
 * 
 * Given a value (and a row as context), modify that value.
 */
export abstract class RowOperator {
  /**
   * Run the operation.
   * @param value The value to modify.
   * @param row The row as context.
   * @param runner The running context.
   */
  abstract run(input: RowInput): Maybe<string>;

  static runMany(rows: RowOperator[], _input: Omit<RowInput, "value">): Maybe<string> {
    const input = { ..._input, value: "" };

    for (const operation of rows) {
      const result = operation.run(input);
      if (result == null) return result;
      input.value = result;
    }

    return input.value;
  }
}
