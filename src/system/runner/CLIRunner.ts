import { Transformer } from "../transformer";
import { State } from "../information/State";
import * as XLSX from "xlsx";
import { parseRebateFile, Rebate } from "../util";
import { writeFile } from "node:fs/promises";

interface IdleStatus {
  type: "idle";
}

interface RunningStatus {
  type: "running";
  progress: number;
}

export type RunnerStatus = IdleStatus | RunningStatus;

/** ------------------------------------------------------------------------- */

interface CLIRunnerOptions {
  quiet?: boolean;
  test?: boolean;
  combine?: boolean;
  onStatus?: (status: RunnerStatus) => void;
}

export class CLIRunner {
  private quiet: boolean;
  private test: boolean;
  private combine: boolean;
  private onStatus?: (status: RunnerStatus) => void;

  constructor(options?: CLIRunnerOptions) {
    const { test = true, quiet = false, combine = true } = options ?? {};

    this.quiet = quiet;
    this.test = test;
    this.combine = combine;
    this.onStatus = options?.onStatus;
  }

  public async pushRebates(state: State) {
    const { strategy } = state.getSettings();
    const rebate_groups = await strategy.listActualGroups();

    const rebate_files = new Array<string>();
    for (const rebate_group of rebate_groups) {
      rebate_files.push(...await strategy.listActualPaths(rebate_group));
    }

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

  async compareRebates(group: string, state: State) {
    const actual_files = await state.getSettings().strategy.listActualPaths(group);
    const actual = (await Promise.all(actual_files.map(parseRebateFile))).flat();
    const expected_files = await state.getSettings().strategy.listExpectedPaths(group);
    const expected = (await Promise.all(expected_files.map(parseRebateFile))).flat();
  
    const actual_allowed_set = new Set();
    for (const rebate of actual) {
      rebate.purchaseId = "X";
  
      const rebateAmount = Number(rebate.rebateAmount.replace(/[$,]/g, ""));
      actual_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount - 0.01).toFixed(2)}` }).join());
      actual_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.00).toFixed(2)}` }).join());
      actual_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.01).toFixed(2)}` }).join());
    }
  
    const expected_allowed_set = new Set();
    for (const rebate of expected) {
      rebate.purchaseId = "X";
  
      const rebateAmount = Number(rebate.rebateAmount.replace(/[$,]/g, ""));
      expected_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount - 0.01).toFixed(2)}` }).join());
      expected_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.00).toFixed(2)}` }).join());
      expected_allowed_set.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.01).toFixed(2)}` }).join());
    }
  
    const actual_set = actual.map((r) => Object.values(r).join());
    const expected_set = expected.map(r => Object.values(r).join());
  
    return { 
      drop: actual_set.filter(r1 => !expected_allowed_set.has(r1)),
      take: expected_set.filter(r2 => !actual_allowed_set.has(r2)),
    }
  }

  printResults(results: RunResults) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log('==== [PERFORMANCE] ====\n')
    for (const config of results.config) {
      console.log(`\t${config.name}: ${(config.end - config.start).toFixed(2)}ms`)
    }

    console.log('\n==== [COMPARING SOURCES] ====');
    for (const discrepency of results.discrepency) {
      const { take, drop, name } = discrepency;

      console.log(`\n${name}: +${take.length} -${drop.length}.`);
      for (const line of drop) {
        console.log("\t[-]", line)
      }

      if (drop.length > 0 && take.length > 0) console.log('');

      for (const line of take) {
        console.log("\t[+]", line)
      }
    }
  }

  public async run(state: State) {
    const transformer_files = await state.getSettings().strategy.listTransformerPaths();

    const results: RunResults = {
      config: [],
      discrepency: [],
    }

    for (const [index, transformer_file] of transformer_files.entries()) {
      this.onStatus?.({ type: "running", progress: index / transformer_files.length });
      const transformer = await Transformer.fromFile(transformer_file);
      
      if (!this.quiet) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`[${index + 1}/${transformer_files.length}] Running ${transformer.name}...`);
      }
      results.config.push(await transformer.run(state));
    }

    this.onStatus?.({ type: "running", progress: 1 });

    if (this.test) {
      const rebates_groups = await state.getSettings().strategy.listActualGroups();
      for (const group of rebates_groups) {
        const { take, drop } = await this.compareRebates(group, state);

        results.discrepency.push({ name: group, take, drop })
      }
    }

    this.onStatus?.({ type: "idle" });

    if (!this.quiet) {
      this.printResults(results);
    }

    if (this.combine) {
      this.pushRebates(state);
    }
  }
}
