import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Add another value to the current value, based on another set of row
 * transformations.
 */
export class AddRow implements BaseRow {
  /** The other row transformations, whose result will be added. */
  private readonly other: BaseRow[];

  /**
   * Create an add operation.
   * @param other The other row transformations, whose result will be added.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (Number(value) + Number(other_value)).toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("add"),
    with: z.lazy(() => z.array(ROW_SCHEMA))
  }).transform(s => new AddRow(s.with));

  buildXML(from: XMLElement): void {
    const element = from.element("add");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("add",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new AddRow(x.children))
}
