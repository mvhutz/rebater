import { z } from "zod/v4";
import { rewire } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class HeaderTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("header"),
    name: z.string(),
    action: z.union([z.literal("drop")]),
  }).transform(s => new HeaderTable(s.name, s.action));

  private readonly name: string;
  private readonly action: "drop";

  public constructor(name: string, action: "drop") {
    this.name = name;
    this.action = action;
  }

  async run(table: Table): Promise<Table> {
    const index = table.data[0].data.findIndex(r => r === this.name);
    if (index === -1) return table;

    const rows = table.data.map(r => ({
      ...r,
      data: r.data.filter((_, i) => i !== index)
    }));

    return rewire({ ...table, data: rows });
  }

  buildXML(from: XMLElement): void {
    from.element("header", {
      name: this.name,
      action: this.action,
    })
  }
}