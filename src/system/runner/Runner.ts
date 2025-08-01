import { Transformer } from "../transformer";
import { getPartition, getRebateHash, RebateSet } from "../util";
import EventEmitter from "events";
import { Settings } from "../../shared/settings";
import { DiscrepencyResult, Rebate, RunResults, SystemStatus } from "../../shared/worker/response";
import { ReferenceStore } from "../information/ReferenceStore";
import { SourceStore } from "../information/SourceStore";
import { DestinationStore } from "../information/DestinationStore";
import { Asker } from "./Asker";
import { OutputStore } from "../information/OutputStore";
import { TruthStore } from "../information/TruthStore";
import { Counter } from "../information/Counter";
import { ExcelRebateFile } from "../information/items/ExcelRebateFile";
import { UtilityStore } from "../information/UtilityStore";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

interface RunnerEvents {
  status: [SystemStatus];
}

export class Runner extends EventEmitter<RunnerEvents> {
  public readonly counter: Counter;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;
  public readonly truths: TruthStore;
  public readonly outputs: OutputStore;
  public readonly utilities: UtilityStore;
  public readonly asker = new Asker();

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
    this.utilities = new UtilityStore({ directory: settings.getAllUtilityPath() })
    this.running = false;

    this.emit("status", { type: "idle" });
  }

  compareRebates(actual: Rebate[], expected: Rebate[]): Omit<DiscrepencyResult, "name"> {
    const actual_set = new RebateSet(actual);
    const expected_set = new RebateSet(expected);

    actual.forEach(r => expected_set.take(r));
    expected.forEach(r => actual_set.take(r));

    return {
      drop: actual_set.values().map(getRebateHash),
      take: expected_set.values().map(getRebateHash),
    }
  }

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
      const { drop, take } = this.compareRebates(actual_partition_bucket, expected_partition_bucket);
      results.push({ name: member_id, drop: drop, take: take });
    }

    return results;
  }

  private async load() {
    await this.sources.gather();
    await this.sources.load();
    await this.references.gather();
    await this.references.load();
    await this.truths.gather();
    await this.truths.load();
  }

  public async save() {
    await this.destinations.save();
    await this.references.save();
    await this.outputs.save();
    await this.utilities.save();
  }

  private async* iterator(): AsyncIterableIterator<SystemStatus> {
    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    yield { type: "loading", message: "Reading transformers..." };
    const transformers_unordered = await Transformer.pullAll(this.settings, true);
    const transformers = Transformer.findValidOrder(transformers_unordered);

    yield { type: "loading", message: "Loading sources..." };
    await this.load();

    for (const [i, transformer] of transformers.entries()) {
      yield { type: "running", progress: i / transformers.length };
      try {
        results.config.push(await transformer.run(this));
      } catch (error) {
        const start = `While running ${transformer.name}:\n\n`;
        if (error instanceof z.ZodError) {
          throw Error(`${start}${z.prettifyError(error)}`);
        } else if (error instanceof Error) {
          throw Error(`${start}${error.message}`);
        } else {
          throw Error(`${start}${error}`);
        }
      }
    }

    if (this.settings.doTesting()) {
      yield { type: "loading", message: "Scoring accuracy..." };
      results.discrepency = await this.compareAllRebates();
    }

    yield { type: "loading", message: "Compiling rebates..." };
    const output = new ExcelRebateFile(this.settings.getOutputFile("xlsx"), {
      quarter: this.settings.time
    });
    output.add(...this.destinations.getItems());
    this.outputs.add(output);

    yield { type: "loading", message: "Saving data..." };
    await this.save();
    
    yield { type: "done", results: results };
  }

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

  public stop() {
    this.running = false;
  }
}
