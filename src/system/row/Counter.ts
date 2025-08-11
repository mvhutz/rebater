import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { XMLElement } from "xmlbuilder";
import { makeNodeElementSchema } from "../xml";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

/**
 * Extract the value of a certain counter.
 */
export class CounterRow implements BaseRow {
  async run(_v: string, _r: Row, runner: Runner): Promise<string> {
    return runner.counter.getThenIncrement("counter").toString();
  }

  public static readonly SCHEMA = z.strictObject({
    type: z.literal("counter"),
  }).transform(() => new CounterRow());

  buildXML(from: XMLElement): void {
    from.element("counter");
  }

  public static readonly XML_SCHEMA = makeNodeElementSchema("counter",
    z.undefined(),
    z.undefined())
    .transform(() => new CounterRow())
}
