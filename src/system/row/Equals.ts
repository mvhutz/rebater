import { z } from "zod/v4";
import { BaseRow, ROW_SCHEMA, runMany } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class EqualsRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("equals"),
    with: z.lazy(() => z.array(ROW_SCHEMA)),
  }).transform(s => new EqualsRow(s.with));

  private readonly other: BaseRow[];

  public constructor(other: BaseRow[]) {
    this.other = other;
  }

  async run(value: string, row: Row, runner: Runner): Promise<string> {
    const other_value = await runMany(this.other, row, runner);
    return (value === other_value).toString();
  }

  buildXML(from: XMLElement): void {
      const element = from.element("equals");
      for (const child of this.other) {
        child.buildXML(element);
      }
    }
}
