import { Transformer } from "./transformer";
import { State } from "./information/State";
import XLSX from 'xlsx';
import { parseRebateFile } from "./util";

/** ------------------------------------------------------------------------- */

export class Runner {
  public async pushRebates(state: State) {
    const rebates = await state.getSettings().listActualGroups();
  
    const sheet = XLSX.utils.json_to_sheet(rebates);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Rebates");
    
    const file = state.getSettings().getOutputFile();
    XLSX.writeFileXLSX(book, file);
  }

  async compareRebates(group: string, state: State) {
    const actual_files = await state.getSettings().listActualPaths(group);
    const actual = (await Promise.all(actual_files.map(parseRebateFile))).flat();
    const expected_files = await state.getSettings().listExpectedPaths(group);
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
  
    const actual_set = actual.map(r => Object.values(r).join());
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
    const transformer_files = await state.getSettings().listTransformerPaths();

    const results: RunResults = {
      config: [],
      discrepency: [],
    }

    for (const [index, transformer_file] of transformer_files.entries()) {
      const transformer = await Transformer.fromFile(transformer_file);

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`[${index + 1}/${transformer_files.length}] Running ${transformer.name}...`);
      state.handlers.onStartTransformer?.(transformer, index, transformer_files.length);
      results.config.push(await transformer.run(state));
    }

    const rebates_groups = await state.getSettings().listActualGroups();
    for (const group of rebates_groups) {
      const { take, drop } = await this.compareRebates(group, state);

      results.discrepency.push({ name: group, take, drop })
    }

    this.printResults(results);
    this.pushRebates(state);
  }
}
