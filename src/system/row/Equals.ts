import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row, Table } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Compare the current value with the value of anotehr set of row
 * transformations.
 * 
 * If they equal, this operation returns "true". Otherwise, it returns "false".
 */
export class EqualsRow implements BaseRow {
  /** The other set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create an equals operation.
   * @param other The other set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, runner: Runner, table: Table): Promise<string> {
    const other_value = await BaseRow.runMany(this.other, row, runner, table);
    return (value === other_value).toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("equals"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new EqualsRow(s.with));

  buildXML(from: XMLElement): void {
    const element = from.element("equals");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("equals",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new EqualsRow(x.children))
}
