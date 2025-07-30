import { z } from "zod/v4";
import { BaseRow } from ".";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class LiteralRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("literal"),
    value: z.coerce.string()
  }).transform(s => new LiteralRow(s.value));

  private readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  async run(): Promise<string> {
    return this.value;
  }

  build(from: XMLElement): void {
    from.element("literal", undefined, this.value);
  }
}
