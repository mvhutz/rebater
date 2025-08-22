import { getPartition, getRebateHash } from "../util";
import EventEmitter from "events";
import { Settings } from "../../shared/settings";
import { DiscrepencyResult, Question, Rebate, RunResults, SystemStatus } from "../../shared/worker/response";
import { ReferenceStore } from "../information/stores/ReferenceStore";
import { SourceStore } from "../information/stores/SourceStore";
import { DestinationStore } from "../information/stores/DestinationStore";
import { OutputStore } from "../information/stores/OutputStore";
import { TruthStore } from "../information/stores/TruthStore";
import { Counter } from "../information/Counter";
import { ExcelRebateFile } from "../information/items/ExcelRebateFile";
import { UtilityStore } from "../information/stores/UtilityStore";
import z from "zod/v4";
import { RebateSet } from "./RebateSet";
import { bad, good, Reply } from "../../shared/reply";
import { TransformerStore } from "../information/stores/TransformerStore";

/** ------------------------------------------------------------------------- */

/** Runner events to subscribe to. */
interface RunnerEvents {
  status: [SystemStatus];
  ask: [Question];
}

/**
 * Handles execution of the program.
 */
export class Runner extends EventEmitter<RunnerEvents> {
  public readonly counter: Counter;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;
  public readonly truths: TruthStore;
  public readonly outputs: OutputStore;
  public readonly utilities: UtilityStore;
  public readonly transformers: TransformerStore;

  private running: boolean;

  public constructor(settings: Settings) {
    super();

    this.settings = settings;
    this.counter = new Counter();
    this.references = new ReferenceStore({ directory: settings.getReferencePath() });
    this.sources = new SourceStore({ directory: settings.getAllSourcePath() });
    this.destinations = new DestinationStore({ directory: settings.getAllDestinationPath() });
    this.outputs = new OutputStore({ directory: settings.getAllOutputPath() });
    this.truths = new TruthStore({ directory: settings.getAllTruthPath() });
    this.utilities = new UtilityStore({ directory: settings.getAllUtilityPath() });
    this.transformers = new TransformerStore({ directory: settings.getAllTransformerPath() })
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
    const actual = this.destinations.getItems().map(d => d.getData()).flat(1);
    const actual_partitions = getPartition(actual, "supplierId");

    const expected = this.truths.getItems().filter(t => t.meta.quarter.is(this.settings.time)).map(t => t.getData()).flat(1);
    const expected_partitions = getPartition(expected, "supplierId");

    const results = new Array<DiscrepencyResult>();
    const member_ids = new Set([...expected_partitions.keys(), ...actual_partitions.keys()]);

    for (const member_id of member_ids) {
      if (!this.settings.doCompareAll() && !actual_partitions.has(member_id)) {
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
   * Load all stores.
   */
  private async load(): Promise<Reply> {
    try {
      this.sources.wipe();
      this.references.wipe();
      this.truths.wipe();
      this.transformers.wipe();
      this.destinations.wipe();
      this.outputs.wipe();
      this.utilities.wipe();

      await this.sources.gather();
      await this.sources.load();
      await this.references.gather();
      await this.references.load();
      await this.truths.gather();
      await this.truths.load();
      await this.transformers.gather();
      await this.transformers.load();
      return good(undefined);
    } catch (err) {
      return bad(`${err}`);
    }
  }

  /**
   * Save all stores.
   */
  public async save() {
    await this.destinations.save();
    await this.references.save();
    await this.outputs.save();
    await this.utilities.save();
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
    const load_reply = await this.load();
    if (!load_reply.ok) {
      yield { type: "error", message: load_reply.reason };
      return;
    }

    const transformers = TransformerStore.getOrdered(this.transformers.getValid().filter(t => this.settings.willRun(t.getDetails())));

    // Run the transformers.
    for (const [i, transformer] of transformers.entries()) {
      const details = transformer.getDetails();
      yield { type: "running", progress: i / transformers.length };
      try {
        results.config.push(transformer.run(this));
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
    if (this.settings.testing) {
      yield { type: "loading", message: "Scoring accuracy..." };
      results.discrepency = await this.compareAllRebates();
    }

    // Create the output file.
    yield { type: "loading", message: "Compiling rebates..." };
    const output = new ExcelRebateFile(this.settings.getOutputFile("xlsx"), {
      quarter: this.settings.time
    });
    output.add(...this.destinations.getItems());
    this.outputs.add(output);

    // Saving stores.
    yield { type: "loading", message: "Saving data..." };
    await this.save();
    
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
        await this.save();
        
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
