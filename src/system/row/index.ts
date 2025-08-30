import { Row, Table } from "../information/Table";
import { State } from "../../shared/state";
import { Context } from "../../shared/context";
import { bad, good, Reply } from "../../shared/reply";

/** ------------------------------------------------------------------------- */

export interface RowInput {
  value: string;
  row: Row;
  state: State;
  table: Table;
  context: Context;
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
  abstract run(input: RowInput): string;

  static runMany(rows: RowOperator[], _input: Omit<RowInput, "value">): Reply<string> {
    try {
      return good(RowOperator.runManyUnsafe(rows, _input));
    } catch (err) {
      return bad(`${err}`);
    }
  }

  static runManyUnsafe(rows: RowOperator[], _input: Omit<RowInput, "value">): string {
    const input = { ..._input, value: "" };

    for (const operation of rows) {
      const result = operation.run(input);
      input.value = result;
    }

    return input.value;
  }
}
