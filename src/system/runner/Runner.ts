import { getPartition, getRebateHash } from "../util";
import EventEmitter from "events";
import { DiscrepencyResult, Rebate, RunResults, SystemStatus } from "../../shared/worker/response";
import z from "zod/v4";
import { RebateSet } from "./RebateSet";
import { Transformer } from "../transformer/Transformer";
import { State } from "../../shared/state";
import { ExcelRebateFile } from "../../shared/state/items/ExcelRebateFile";

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

  private running: boolean;

  public constructor(state: State) {
    super();

    this.state = state;
    this.running = false;

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
    const actual = this.state.destinations.getItems().map(d => d.getData()).flat(1);
    const actual_partitions = getPartition(actual, "supplierId");

    const expected = this.state.truths.getItems().filter(t => t.meta.quarter.is(this.state.settings.time)).map(t => t.getData()).flat(1);
    const expected_partitions = getPartition(expected, "supplierId");

    const results = new Array<DiscrepencyResult>();
    const member_ids = new Set([...expected_partitions.keys(), ...actual_partitions.keys()]);

    for (const member_id of member_ids) {
      if (!this.state.settings.doCompareAll() && !actual_partitions.has(member_id)) {
        continue;
      }

      const expected_partition_bucket = expected_partitions.get(member_id) ?? [];
      const actual_partition_bucket = actual_partitions.get(member_id) ?? [];
      const { drop, take, match } = Runner.compareRebates(actual_partition_bucket, expected_partition_bucket);
      results.push({ name: member_id, drop, take, match });
    }

    return results;
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
    const load_reply = await this.state.load();
    if (!load_reply.ok) {
      yield { type: "error", message: load_reply.reason };
      return;
    }

    const transformers = Transformer.findValidOrder(this.state.transformers.getValid().map(Transformer.parseTransformer).filter(t => this.state.settings.willRun(t.getDetails())));

    // Run the transformers.
    for (const [i, transformer] of transformers.entries()) {
      const details = transformer.getDetails();
      yield { type: "running", progress: i / transformers.length };
      try {
        results.config.push(transformer.run(this.state));
      } catch (error) {
        const start = `While running ${details.name}:\n\n`;
        if (error instanceof z.ZodError) {
          throw Error(`${start}${z.prettifyError(error)}`);
        } else if (error instanceof Error) {
          throw Error(`${start}${error.message}`);
        } else {
          throw Error(`${start}${error}`);
        }
      }
    }

    // Optionally, create a discrepancy report.
    if (this.state.settings.testing) {
      yield { type: "loading", message: "Scoring accuracy..." };
      results.discrepency = await this.compareAllRebates();
    }

    // Create the output file.
    yield { type: "loading", message: "Compiling rebates..." };
    const output = new ExcelRebateFile(this.state.settings.getOutputFile("xlsx"), {
      quarter: this.state.settings.time
    });
    output.add(...this.state.destinations.getItems());
    this.state.outputs.add(output);

    // Saving stores.
    yield { type: "loading", message: "Saving data..." };
    await this.state.save();
    
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
        this.emit('status', { type: "loading", message: "Saving data..." });
        await this.state.save();
        
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
