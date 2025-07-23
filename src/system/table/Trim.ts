import { z } from "zod/v4";
import { BaseTable } from ".";
import { rewire } from "../util";

/** ------------------------------------------------------------------------- */

export class TrimTable implements BaseTable {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("trim"),
    top: z.number().optional(),
    bottom: z.number().optional(),
  }).transform(s => new TrimTable(s.top, s.bottom));

  private readonly top?: number;
  private readonly bottom?: number;

  public constructor(top?: number, bottom?: number) {
    this.top = top == null ? undefined : top;
    this.bottom = bottom == null ? undefined : -bottom;
  }

  async run(table: Table): Promise<Table> {
    table.data = table.data.slice(this.top, this.bottom);
    return rewire(table);
  }
}

