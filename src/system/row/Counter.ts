import { z } from "zod/v4";
import { BaseRow } from ".";
import { Runner } from "../runner/Runner";
import { Row } from "../information/Table";

/** ------------------------------------------------------------------------- */

export interface CounterRowData {
  type: "counter"
}

/** ------------------------------------------------------------------------- */

/**
 * Extract the value of a certain counter.
 */
export class CounterRow implements BaseRow {
  run(_v: string, _r: Row, runner: Runner,): Maybe<string> {
    return runner.counter.getThenIncrement("counter").toString();
  }

  buildJSON(): CounterRowData {
    return { type: "counter" };
  }

  public static readonly SCHEMA: z.ZodType<BaseRow, CounterRowData> = z.strictObject({
    type: z.literal("counter"),
  }).transform(() => new CounterRow());
}
