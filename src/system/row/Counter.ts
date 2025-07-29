import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";

/** ------------------------------------------------------------------------- */

export class CounterRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("counter"),
  }).transform(() => new CounterRow());

  async run(_v: string, _r: Row, runner: Runner): Promise<string> {
    const counter = runner.counters.get("counter");
    return counter.getThenIncrement().toString();
  }
}
