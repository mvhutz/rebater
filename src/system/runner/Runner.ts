import { Transformer } from "../transformer";
import { State } from "../information/State";
import * as XLSX from "xlsx";
import { getPartition, getRebateHash, parseRebateFile, Rebate, RebateSet } from "../util";
import { mkdir, writeFile, glob } from "fs/promises";
import path from "path";
import EventEmitter from "events";
import { Settings } from "../../shared/settings";
import { DiscrepencyResult, RunResults, SystemStatus } from "../../shared/worker/response";
import { Asker } from "./Asker";

/** ------------------------------------------------------------------------- */

interface RunnerEvents {
  status: [SystemStatus];
  question: [string];
}

export class Runner extends EventEmitter<RunnerEvents> {
  public asker = new Asker();

  public constructor() {
    super();

    this.emit("status", { type: "idle" });
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
      drop: actual_set.values().map(getRebateHash),
      take: expected_set.values().map(getRebateHash),
    }
  }

  async compareAllRebates(state: State): Promise<DiscrepencyResult[]> {
    const actual = state.destinations.get().map(d => d.getData() ?? []).flat();

    const expected_glob = state.settings.getTruthPathGlob();
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

  public async run(settings: Settings) {
    const state = new State(settings, async question => {
      this.emit("question", question);
      return await this.asker.ask(question);
    });

    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    this.emit("status", { type: "loading", message: "Reading transformers..." });
    const transformers = await Transformer.pullAll(state.settings, true);

    this.emit("status", { type: "loading", message: "Loading sources..." });
    await state.sources.gather();
    await state.sources.load();
    await state.references.load();

    for (const [i, transformer] of transformers.entries()) {
      this.emit("status", { type: "running", progress: i / transformers.length });

      results.config.push(await transformer.run(state));
    }

    this.emit("status", { type: "loading", message: "Saving data..." });

    await state.destinations.save();
    await state.references.save();

    if (state.settings.doTesting()) {
      this.emit("status", { type: "loading", message: "Scoring accuracy..." });
      results.discrepency = await this.compareAllRebates(state);
    }

    this.emit("status", { type: "loading", message: "Compiling rebates..." });
    await this.pushRebates(state);
    
    this.emit("status", { type: "done", results: results });
  }
}
