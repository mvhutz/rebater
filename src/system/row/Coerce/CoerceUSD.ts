import { z } from "zod/v4";
import { BaseRow } from "..";
import { XMLElement } from "xmlbuilder";

/** ------------------------------------------------------------------------- */

export class CoerceUSDRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("coerce"),
    as: z.literal("usd"),
    round: z.union([z.literal("up"), z.literal("down"), z.literal("default")]).default("default"),
  }).transform(s => new CoerceUSDRow(s.round));

  private readonly round: "up" | "down" | "default";

  public constructor(round: "up" | "down" | "default") {
    this.round = round;
  }

  async run(datum: string): Promise<string> {
    let value = Number(datum);

    switch (this.round) {
      case "down": value = Math.floor(value * 100) / 100; break;
      case "up": value = Math.ceil(value * 100) / 100; break;
      default: break;
    }

    return value.toFixed(2);
  }

  build(from: XMLElement): void {
    from.element("coerce", {
      as: "usd",
      round: this.round,
    })
  }
}
