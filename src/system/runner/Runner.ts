import { Transformer } from "../transformer";
import * as XLSX from "xlsx";
import { getPartition, getRebateHash, parseRebateFile, Rebate, RebateSet } from "../util";
import { mkdir, writeFile, glob } from "fs/promises";
import path from "path";
import EventEmitter from "events";
import { Settings } from "../../shared/settings";
import { DiscrepencyResult, RunResults, SystemStatus } from "../../shared/worker/response";
import { CounterStore } from "../information/counter/CounterStore";
import { ReferenceStore } from "../information/store/ReferenceStore";
import { SourceStore } from "../information/store/SourceStore";
import { DestinationStore } from "../information/destination/DestinationStore";
import { Asker } from "./Asker";

/** ------------------------------------------------------------------------- */

interface RunnerEvents {
  status: [SystemStatus];
}

export class Runner extends EventEmitter<RunnerEvents> {
  public readonly counters: CounterStore;
  public readonly references: ReferenceStore;
  public readonly settings: Settings;
  public readonly sources: SourceStore;
  public readonly destinations: DestinationStore;
  public readonly asker = new Asker();

  private running: boolean;

  public constructor(settings: Settings) {
    super();

    this.settings = settings;
    this.counters = new CounterStore();
    this.references = new ReferenceStore(settings.getReferencePath());
    this.sources = new SourceStore(settings.getAllSourcePath());
    this.destinations = new DestinationStore(settings.getAllDestinationPath());
    this.running = false;

    this.emit("status", { type: "idle" });
  }

  public async pushRebates() {
    const rebate_glob = this.settings.getRebatePathGlob();
    const rebate_files = await Array.fromAsync(glob(rebate_glob));

    const rebates = new Array<Rebate>();
    for (const rebate_file of rebate_files) {
      rebates.push(...await parseRebateFile(rebate_file));
    }

    const sheet = XLSX.utils.json_to_sheet(rebates);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    const buffer = XLSX.write(book, { type: "buffer" });
    
    const file = this.settings.getOutputFile("xlsx");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
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
    const actual = this.destinations.rebates;

    const expected_glob = this.settings.getTruthPathGlob();
    const expected_files = await Array.fromAsync(glob(expected_glob));
    const expected = (await Promise.all(expected_files.map(parseRebateFile))).flat();

    const results = new Array<DiscrepencyResult>();

    const actual_partitions = getPartition(actual, "supplierId");
    const expected_partitions = getPartition(expected, "supplierId");

    for (const [member_id, actual_partition_bucket] of actual_partitions) {
      const expected_partition_bucket = expected_partitions.get(member_id) ?? [];
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
  }

  private async save() {
    await this.destinations.save();
    await this.references.save();
  }

  private async* iterator(): AsyncIterableIterator<SystemStatus> {
    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    yield { type: "loading", message: "Reading transformers..." };
    const transformers = await Transformer.pullAll(this.settings, true);

    yield { type: "loading", message: "Loading sources..." };
    await this.load();

    for (const [i, transformer] of transformers.entries()) {
      yield { type: "running", progress: i / transformers.length };
      results.config.push(await transformer.run(this));
    }

    yield { type: "loading", message: "Saving data..." };
    await this.save();

    if (this.settings.doTesting()) {
      yield { type: "loading", message: "Scoring accuracy..." };
      results.discrepency = await this.compareAllRebates();
    }

    yield { type: "loading", message: "Compiling rebates..." };
    await this.pushRebates();
    
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
