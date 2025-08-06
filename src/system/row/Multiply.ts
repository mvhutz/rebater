import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, ROW_XML_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

/**
 * Multiply the current value with the result of anotehr set of row transformations.
 */
export class MultiplyRow implements BaseRow {
  /** The set of row transformations. */
  private readonly other: BaseRow[];

  /**
   * Create a multiply operation.
   * @param other The set of row transformations.
   */
  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const other_value = await runMany(this.other, row, runner);
    return (Number(value) * Number(other_value)).toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("multiply"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new MultiplyRow(s.with));

  buildXML(from: XMLElement): void {
    const element = from.element("multiply");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("multiply",
    z.undefined(),
    z.array(z.lazy(() => ROW_XML_SCHEMA)))
    .transform(x => new MultiplyRow(x.children))
}
