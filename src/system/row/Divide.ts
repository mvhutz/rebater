import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class DivideRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("divide"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new DivideRow(s.with));

  private readonly other: BaseRow[];

  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const other_value = await runMany(this.other, row, runner);
    return (Number(value) / Number(other_value)).toString();
  }

  buildXML(from: XMLElement): void {
    const element = from.element("divide");
    for (const child of this.other) {
      child.buildXML(element);
    }
  }
}
