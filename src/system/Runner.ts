import { Transformer } from "./Transformer";
import { State } from "./information/State";
import * as XLSX from "xlsx";
import { getPartition, getRebateHash, getRebateHashFuzzy, parseRebateFile, Rebate } from "./util";
import { writeFile } from "fs/promises";

interface IdleStatus {
  type: "idle";
}

interface DoneStatus {
  type: "done";
  results: RunResults;
}

interface ErrorStatus {
  type: "error";
  message?: string;
}

interface RunningStatus {
  type: "running";
  progress: number;
}

export type RunnerStatus = IdleStatus | RunningStatus | DoneStatus | ErrorStatus;

/** ------------------------------------------------------------------------- */

interface RunnerOptions {
  quiet?: boolean;
  test?: boolean;
  combine?: boolean;
  onStatus?: (status: RunnerStatus) => void;
}

export class Runner {
  private onStatus?: (status: RunnerStatus) => void;

  constructor(options?: RunnerOptions) {
    this.onStatus = options?.onStatus;
  }

  public async pushRebates(state: State) {
    const { strategy } = state.getSettings();
    const rebate_files = await strategy.getRebatePaths(state.getTime());

    const rebates = new Array<Rebate>();
    for (const rebate_file of rebate_files) {
      rebates.push(...await parseRebateFile(rebate_file));
    }

    const sheet = XLSX.utils.json_to_sheet(rebates);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    const buffer = XLSX.write(book, { type: "buffer" });
    
    const file = state.getSettings().strategy.getOutputFile();
    await writeFile(file, buffer);
  }

  compareRebates(actual: Rebate[], expected: Rebate[]): Omit<DiscrepencyResult, "name"> {
    const actual_allowed_set = new Set();
    for (const rebate of actual) {
      getRebateHashFuzzy(rebate).forEach(s => actual_allowed_set.add(s));
    }
  
    const expected_allowed_set = new Set();
    for (const rebate of expected) {
      getRebateHashFuzzy(rebate).forEach(s => actual_allowed_set.add(s));
    }
  
    const actual_set = actual.map(getRebateHash);
    const expected_set = expected.map(getRebateHash);

    return {
      drop: actual_set.filter(r1 => !expected_allowed_set.has(r1)),
      take: expected_set.filter(r2 => !actual_allowed_set.has(r2)),
    }
  }

  async compareAllRebates(state: State): Promise<DiscrepencyResult[]> {
    const { strategy } = state.getSettings();

    const actual_files = await strategy.getRebatePaths(state.getTime());
    const actual = (await Promise.all(actual_files.map(parseRebateFile))).flat();
    
    const expected_files = await strategy.getTruthPaths(state.getTime());
    const expected = (await Promise.all(expected_files.map(parseRebateFile))).flat();
  
    const results = new Array<DiscrepencyResult>();

    const actual_partitions = getPartition(actual, "supplierId");
    const expected_partitions = getPartition(expected, "supplierId");

    for (const [member_id, actual_partition_bucket] of actual_partitions) {
      const expected_partition_bucket = expected_partitions.get(member_id) ?? [];
      const { drop, take } = this.compareRebates(actual_partition_bucket, expected_partition_bucket);
      results.push({ name: member_id, drop, take });
    }

    return results;
  }

  public async run(state: State) {
    const transformer_files = await state.getSettings().strategy.listTransformerPaths();

    const results: RunResults = {
      config: [],
      discrepency: [],
    }

    const transformers = new Array<Transformer>();

    for (const transformer_file of transformer_files) {
      transformers.push(await Transformer.fromFile(transformer_file));
    }

    for (const transformer of transformers) {
      await state.loadSourceFilesQueries(...transformer.getSourcesGlobs(state));
    }

    for (let i = 0; i < transformers.length; i++) {
      const transformer = transformers[i];
      this.onStatus?.({ type: "running", progress: i / transformer_files.length });

      results.config.push(await transformer.run(state));
    }

    this.onStatus?.({ type: "running", progress: 1 });

    await state.saveDestinationFiles();

    results.discrepency = await this.compareAllRebates(state);

    this.onStatus?.({ type: "done", results: results });

    this.pushRebates(state);
  }
}
