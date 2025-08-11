import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Divide the current value with the result of anotehr set of row transformations.
 */
export class DivideRow implements BaseRow {
  /** The set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create a divide operation.
   * @param other The set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  run(value: string, row: Row, runner: Runner, table: Table): Maybe<string> {
    const other_value = BaseRow.runMany(this.other, row, runner, table);
    return (Number(value) / Number(other_value)).toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("divide"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new DivideRow(s.with));

  buildXML(from: XMLElement): void {
    const element = from.element("divide");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("divide",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new DivideRow(x.children))
}
