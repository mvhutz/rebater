import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { DebugTableData } from "../../shared/transformer/advanced";
import { good } from "../../shared/reply";
import { randomBytes } from "crypto";

/** ------------------------------------------------------------------------- */

/**
 * A utility operation, that prints any table that goes through it.
 */
export class DebugTable implements TableOperator {
  /** The name of the file that table sohuld be printed to. */
  private readonly name: string;

  /**
   * Create a debug operation.
   * @param name The name of the file that table sohuld be printed to.
   */
  public constructor(input: DebugTableData) {
    this.name = input.name;
  }

  run(input: TableInput): Table {
    input.state.debug.mark({
      item: { name: `${randomBytes(8).toString("base64url")}.csv`, group: this.name },
      data: good(input.table.matrix())
    });
    return input.table;
  }
}
