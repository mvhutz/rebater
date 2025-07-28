import { z } from "zod/v4";
import { State } from "../information/State";
import { BaseRow } from ".";

/** ------------------------------------------------------------------------- */

export class CounterRow implements BaseRow {
  public static readonly SCHEMA = z.strictObject({
    type: z.literal("counter"),
  }).transform(() => new CounterRow());

  async run(_v: string, _r: Row, state: State): Promise<string> {
    const counter = state.counters.get("counter");
    return counter.getThenIncrement().toString();
  }
}
