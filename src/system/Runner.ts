import { Transformer } from "./Transformer";
import { BasicState, State } from "./information/State";
import * as XLSX from "xlsx";
import { getPartition, getRebateHash, getRebateHashFuzzy, parseRebateFile, Rebate } from "./util";
import { mkdir, writeFile, glob } from "fs/promises";
import path from "path";
import { SystemStatus } from "../shared/system_status";
import { SettingsInterface } from "src/shared/settings_interface";

/** ------------------------------------------------------------------------- */

interface RunnerOptions {
  quiet?: boolean;
  combine?: boolean;
  onStatus?: (status: SystemStatus) => void;
  onQuestion?: (question: string) => Promise<Maybe<string>>
}

export class Runner {
  private onStatus?: (status: SystemStatus) => void;
  private onQuestion?: (question: string) => Promise<Maybe<string>>;
  private status: SystemStatus;

  constructor(options?: RunnerOptions) {
    this.onStatus = options?.onStatus;
    this.onQuestion = options?.onQuestion;
    this.status = { type: "idle" };
  }

  public updateStatus(status: SystemStatus) {
    this.status = status;
    this.onStatus?.(this.status);
  }

  private async handleQuestion(question: string): Promise<Maybe<string>> {
    const previous_status = this.status;
    this.updateStatus({ type: "asking", question });
    const answer = await this.onQuestion?.(question);
    this.updateStatus(previous_status);
    return answer;
  }

  public async pushRebates(state: State) {
    const rebate_glob = state.getSettings().getRebatePathGlob();
    const rebate_files = await Array.fromAsync(glob(rebate_glob));

    const rebates = new Array<Rebate>();
    for (const rebate_file of rebate_files) {
      rebates.push(...await parseRebateFile(rebate_file));
    }

    const sheet = XLSX.utils.json_to_sheet(rebates);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    const buffer = XLSX.write(book, { type: "buffer" });
    
    const file = state.getSettings().getOutputFile("xlsx");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
  }

  compareRebates(actual: Rebate[], expected: Rebate[]): Omit<DiscrepencyResult, "name"> {
    const actual_allowed_set = new Set();
    for (const rebate of actual) {
      getRebateHashFuzzy(rebate).forEach(s => actual_allowed_set.add(s));
    }
  
    const expected_allowed_set = new Set();
    for (const rebate of expected) {
      getRebateHashFuzzy(rebate).forEach(s => expected_allowed_set.add(s));
    }
  
    const actual_set = actual.map(getRebateHash);
    const expected_set = expected.map(getRebateHash);

    return {
      drop: actual_set.filter(r1 => !expected_allowed_set.has(r1)),
      take: expected_set.filter(r2 => !actual_allowed_set.has(r2)),
    }
  }

  async compareAllRebates(state: State): Promise<DiscrepencyResult[]> {
    const settings = state.getSettings();

    const actual_glob = settings.getRebatePathGlob();
    const actual_files = await Array.fromAsync(glob(actual_glob));
    const actual = (await Promise.all(actual_files.map(parseRebateFile))).flat();
    
    const expected_glob = settings.getTruthPathGlob();
    const expected_files = await Array.fromAsync(glob(expected_glob));
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

  public async run(isettings: SettingsInterface) {
    const state = new BasicState(isettings, question => this.handleQuestion(question));
    const results: RunResults = {
      config: [],
      discrepency: undefined,
    }

    this.updateStatus({ type: "loading", message: "Reading transformers..." });
    const transformers = await Transformer.pullAll(state.getSettings(), true);

    this.updateStatus({ type: "loading", message: "Loading sources..." });
    for (const transformer of transformers) {
      await state.loadSourceFilesQueries(...transformer.getSourcesGlobs(state));
    }

    for (const [i, transformer] of transformers.entries()) {
      this.updateStatus({ type: "running", progress: i / transformers.length });

      results.config.push(await transformer.run(state));
    }

    this.updateStatus({ type: "loading", message: "Saving data..." });
    await state.saveDestinationFiles();
    await state.saveReferences();

    if (state.getSettings().doTesting()) {
      this.updateStatus({ type: "loading", message: "Scoring accuracy..." });
      results.discrepency = await this.compareAllRebates(state);
    }

    this.updateStatus({ type: "loading", message: "Compiling rebates..." });
    await this.pushRebates(state);
    
    this.updateStatus({ type: "done", results: results });
  }
}
