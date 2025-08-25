import { TableInput, TableOperator } from ".";
import { Table } from "../information/Table";
import { DebugTableData } from "../../shared/transformer/advanced";
import { UtilityDestinationOperator } from "../destination/Utility";

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
    // The debug table is stored as a utility, under the `debug` folder.
    const true_name = `debug/${this.name}/${crypto.randomUUID()}`;
    const utility = new UtilityDestinationOperator({
      type: "utility",
      name: true_name,
    });

    utility.run(input);
    return input.table;
  }
}
