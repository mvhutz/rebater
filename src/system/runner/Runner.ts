import { getPartition, getRebateHash } from "../util";
import EventEmitter from "events";
import { DiscrepencyResult, Rebate, RunResults, SystemStatus } from "../../shared/worker/response";
import z from "zod/v4";
import { RebateSet } from "./RebateSet";
import { Transformer } from "../transformer/Transformer";
import { State } from "../../shared/state";
import { bad, good } from "../../shared/reply";
import { Settings } from "../../shared/settings";
import { Context } from "../../shared/context";

/** ------------------------------------------------------------------------- */

/** Runner events to subscribe to. */
interface RunnerEvents {
  status: [SystemStatus];
}

/**
 * Handles execution of the program.
 */
export class Runner extends EventEmitter<RunnerEvents> {
  public readonly state: State;
  public readonly settings: Settings;
  public readonly context: Context;

  private running: boolean;

  public constructor(state: State, settings: Settings, context: Context) {
    super();

    this.state = state;
    this.running = false;
    this.settings = settings;
    this.context = context;

    this.emit("status", { type: "idle" });
  }

  /**
   * Find the discrepancies between to sets of Rebates.
   * @param actual The actual results.
   * @param expected The expected results.
   * @returns The differences.
   */
  private static compareRebates(actual: Rebate[], expected: Rebate[]): Omit<DiscrepencyResult, "name"> {
    const actual_set = new RebateSet(actual);
    const expected_set = new RebateSet(expected);

    actual.forEach(r => expected_set.take(r));
    expected.forEach(r => actual_set.take(r));

    return {
      match: actual.length - actual_set.values().length,
      drop: actual_set.values().map(getRebateHash),
      take: expected_set.values().map(getRebateHash),
    }
  }

  /**
   * Determine the discrepancies between the actual results of the program, and
   * the expected results.
   * @returns The results.
   */
  async compareAllRebates(): Promise<DiscrepencyResult[]> {
    const actual = this.state.destinations.getValid().flat(1);
    const actual_partitions = getPartition(actual, "supplierId");

    await this.state.truths.pullAll();
    const expected = this.state.truths.getValid(t => t.item.quarter.is(this.context.time)).flat(1);
    const expected_partitions = getPartition(expected, "supplierId");

    const results = new Array<DiscrepencyResult>();
    const member_ids = new Set([...expected_partitions.keys(), ...actual_partitions.keys()]);

    for (const member_id of member_ids) {
      if (!this.settings.data.testing.compare_all && !actual_partitions.has(member_id)) {
        continue;
      }

      const expected_partition_bucket = expected_partitions.get(member_id) ?? [];
      const actual_partition_bucket = actual_partitions.get(member_id) ?? [];
      const { drop, take, match } = Runner.compareRebates(actual_partition_bucket, expected_partition_bucket);
      results.push({ name: member_id, drop, take, match });
    }

    return results;
  }

  public async disconnect() {
    try {
      await this.state.sources.pullAll();
      this.state.sources.unwatch();

      this.state.destinations.unwatch();
      this.state.destinations.wipe();

      this.state.utilities.unwatch();
      this.state.utilities.wipe();

      this.state.debug.unwatch();
      this.state.debug.wipe();

      this.state.tracker.unwatch();
      return good(undefined);
    } catch (err) {
      return bad(`${err}`);
    }
  }

  public async reconnect() {
    try {
      await Promise.all([
        this.state.destinations.pushAll(),
        this.state.tracker.push(),
        this.state.utilities.pushAll(),
        this.state.debug.pushAll(),
        this.state.outputs.pushAll()
      ]);

      this.state.sources.watch();
      this.state.destinations.watch();
      this.state.utilities.watch();
      this.state.debug.watch();
      this.state.tracker.watch();
      return good(undefined);
    } catch (err) {
      return bad(`${err}`);
    }
  }

  /**
   * Runs the program. Returns an iterator, so that the program can be halted,
   * if needed.
   */
  private async* iterator(): AsyncIterableIterator<SystemStatus> {
    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    // Load stores.
    yield { type: "loading", message: "Loading sources..." };
    const load_reply = await this.disconnect();
    if (!load_reply.ok) {
      yield { type: "error", message: load_reply.reason };
      return;
    }

    const transformers = Transformer.findValidOrder(this.state.transformers.getValid().map(Transformer.parseTransformer).filter(t => this.context.willRun(t.getDetails())));

    // Run the transformers.
    for (const [i, transformer] of transformers.entries()) {
      const details = transformer.getDetails();
      yield { type: "running", progress: i / transformers.length };
      try {
        results.config.push(transformer.run(this.state, this.context));
      } catch (error) {
        const start = `While running ${details.name}:\n\n`;
        if (error instanceof z.ZodError) {
          yield { type: "error", message: `${start}${z.prettifyError(error)}` };
        } else if (error instanceof Error) {
          yield { type: "error", message: `${start}${error.message}` };
        } else {
          yield { type: "error", message: `${start}${error}` };
        }

        await this.reconnect();
        return;
      }
    }

    // Optionally, create a discrepancy report.
    if (this.settings.data.testing.enabled) {
      yield { type: "loading", message: "Scoring accuracy..." };
      results.discrepency = await this.compareAllRebates();
    }

    // Create the output file.
    yield { type: "loading", message: "Compiling rebates..." };
    const output_marked = this.state.outputs.mark({
      item: {
        quarter: this.context.time,
        name: "OUTPUT.xlsx"
      },
      data: good(this.state.destinations.getValid().flat(1))
    });

    if (!output_marked.ok) {
      yield { type: "error", message: output_marked.reason };
      await this.reconnect();
      return;
    }

    yield { type: "loading", message: "Saving data..." };
    await this.reconnect();
    
    yield { type: "done", results: results };
  }

  /**
   * Run the program.
   */
  public async run() {
    this.running = true;

    for await (const status of this.iterator()) {
      await new Promise(setImmediate);

      if (!this.running) {        
        this.emit('status', { type: "idle" });
        return;
      }

      this.emit('status', status);
    }
    this.running = false;
  }

  /**
   * Stop the program, during execution.
   */
  public stop() {
    this.running = false;
  }
}
