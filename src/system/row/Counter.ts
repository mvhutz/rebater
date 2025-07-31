import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";

/** ------------------------------------------------------------------------- */

export class CounterRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("counter"),
  }).transform(() => new CounterRow());

  async run(_v: string, _r: Row, runner: Runner): Promise<string> {
    return runner.counter.getThenIncrement("counter").toString();
  }

  buildXML(from: XMLElement): void {
    from.element("counter");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("counter",
    z.undefined(),
    z.undefined())
    .transform(() => new CounterRow())
}
