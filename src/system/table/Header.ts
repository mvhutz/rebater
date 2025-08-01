import { z } from "zod/v4";
import { rewire } from "../util";
import { BaseTable } from ".";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema, makeTextElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class HeaderTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("header"),
    names: z.array(z.string()),
    action: z.union([z.literal("drop"), z.literal("keep")]),
  }).transform(s => new HeaderTable(s.names, s.action));

  private readonly names: string[];
  private readonly action: "drop" | "keep";

  public constructor(names: string[], action: "drop" | "keep") {
    this.names = names;
    this.action = action;
  }

  private takeRow(name: string, table: Table) {
    const index = table.data[0].data.findIndex(r => r === name);
    if (index === -1) return null;

    const rows = table.data.map(r => ({
      ...r,
      data: [r.data[index]]
    }));

    return rewire({ ...table, data: rows });
  }

  private combineColumns(a: Table, b: Table) {
    const rows: Row[] = [];

    for (let i = 0; i < a.data.length; i++) {
      const a_row = a.data[i];
      const b_row = b.data[i];
      rows.push({ table: a, data: a_row.data.concat(b_row.data) });
    }

    return rewire({ path: a.path, data: rows });
  }

  private dropRow(name: string, table: Table) {
    const index = table.data[0].data.findIndex(r => r === name);
    if (index === -1) return table;

    const rows = table.data.map(r => ({
      ...r,
      data: r.data.toSpliced(index, 1)
    }));

    return rewire({ ...table, data: rows });
  }

  async run(table: Table): Promise<Table> {
    if (this.action === "drop") {
      let result = table;

      for (const name of this.names) {
        result = this.dropRow(name, table);
      }
      
      return rewire(result);
    } else {
      let result: Table = { path: table.path, data: table.data.map(() => ({ table: table, data: [] })) };
      for (const name of this.names) {
        const next = this.takeRow(name, table);
        if (next == null) continue;
        result = this.combineColumns(result, next);
      }

      return rewire(result);
    }
  }

  buildXML(from: XMLElement): void {
    const parent = from.element("header", {
      action: this.action,
    });

    for (const name of this.names) {
      parent.element("name", undefined, name);
    }
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("header",
    z.strictObject({
      action: z.union([z.literal("drop"), z.literal("keep")]),
    }),
    z.array(
      makeNodeElementSchema("name", z.undefined(), z.tuple([
        makeTextElementSchema(z.string())
      ]))
    ))
    .transform(({ attributes: a, children: c }) => new HeaderTable(c.map(({ children: cx}) => cx[0].text), a.action));
}