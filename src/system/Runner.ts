import { Transformer } from "./transformer";
import { State } from "./information/State";
import * as XLSX from "xlsx";
import { getPartition, getRebateHash, parseRebateFile, Rebate, RebateSet } from "./util";
import { mkdir, writeFile, glob, rm } from "fs/promises";
import path from "path";
import { SystemStatus } from "../shared/system_status";
import EventEmitter from "events";
import { Settings } from "../shared/settings";

/** ------------------------------------------------------------------------- */

interface RunnerEvents {
  status: [SystemStatus];
  question: [string];
}

export class Runner extends EventEmitter<RunnerEvents> {
  public constructor() {
    super();

    this.emit("status", { type: "idle" });
  }

  private async handleQuestion(): Promise<Maybe<string>> {
    // this.updateStatus({ type: "asking", question });
    // this.once("")
    // const answer = await this.onQuestion?.(question);
    // return answer;
    return null;
  }

  public async pushRebates(state: State) {
    const rebate_glob = state.settings.getRebatePathGlob();
    const rebate_files = await Array.fromAsync(glob(rebate_glob));

    const rebates = new Array<Rebate>();
    for (const rebate_file of rebate_files) {
      rebates.push(...await parseRebateFile(rebate_file));
    }

    const sheet = XLSX.utils.json_to_sheet(rebates);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    const buffer = XLSX.write(book, { type: "buffer" });
    
    const file = state.settings.getOutputFile("xlsx");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
  }

  compareRebates(actual: Rebate[], expected: Rebate[]): Omit<DiscrepencyResult, "name"> {
    const actual_set = new RebateSet(actual);
    const expected_set = new RebateSet(expected);

    actual.forEach(r => expected_set.take(r));
    expected.forEach(r => actual_set.take(r));

    return {
      drop: actual_set.values(),
      take: expected_set.values(),
    }
  }

  async compareAllRebates(state: State): Promise<DiscrepencyResult[]> {
    const actual_glob = state.settings.getRebatePathGlob();
    const actual_files = await Array.fromAsync(glob(actual_glob));
    const actual = (await Promise.all(actual_files.map(parseRebateFile))).flat();

    const expected_glob = state.settings.getTruthPathGlob();
    const expected_files = await Array.fromAsync(glob(expected_glob));
    const expected = (await Promise.all(expected_files.map(parseRebateFile))).flat();

    const results = new Array<DiscrepencyResult>();

    const actual_partitions = getPartition(actual, "supplierId");
    const expected_partitions = getPartition(expected, "supplierId");

    for (const [member_id, actual_partition_bucket] of actual_partitions) {
      const expected_partition_bucket = expected_partitions.get(member_id) ?? [];
      const { drop, take } = this.compareRebates(actual_partition_bucket, expected_partition_bucket);
      results.push({ name: member_id, drop: drop.map(getRebateHash), take: take.map(getRebateHash) });
    }

    return results;
  }

  public async run(settings: Settings) {
    const state = new State(settings, () => this.handleQuestion());
    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    this.emit("status", { type: "loading", message: "Reading transformers..." });
    const transformers = await Transformer.pullAll(state.settings, true);

    this.emit("status", { type: "loading", message: "Loading sources..." });
    for (const transformer of transformers) {
      await state.loadSourceFilesQueries(...transformer.getSourcesGlobs(state));
    }

    await state.reference_store.load(state.settings.getReferencePath());

    for (const [i, transformer] of transformers.entries()) {
      this.emit("status", { type: "running", progress: i / transformers.length });

      results.config.push(await transformer.run(state));
    }

    this.emit("status", { type: "loading", message: "Saving data..." });
    
    for await (const file of glob(state.settings.getRebatePathGlob())) {
      await rm(file);
    }

    await state.saveDestinationFiles();
    await state.reference_store.save(state.settings.getReferencePath());

    if (state.settings.doTesting()) {
      this.emit("status", { type: "loading", message: "Scoring accuracy..." });
      results.discrepency = await this.compareAllRebates(state);
    }

    this.emit("status", { type: "loading", message: "Compiling rebates..." });
    await this.pushRebates(state);
    
    this.emit("status", { type: "done", results: results });
  }
}
