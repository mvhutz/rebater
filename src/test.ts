import { readFile } from "node:fs/promises";
import { parse } from "papaparse";
import XLSX from "xlsx";
import z from "zod/v4";
import { State } from "./information/State";

/** ------------------------------------------------------------------------- */

const RebateSchema = z.strictObject({
  purchaseId: z.string(),
  transactionDate: z.string(),
  supplierId: z.string(),
  memberId: z.string(),
  distributorName: z.string(),
  purchaseAmount: z.string(),
  rebateAmount: z.string(),
  invoiceId: z.string(),
  invoiceDate: z.string(),
});

type Rebate = z.infer<typeof RebateSchema>;

/** ------------------------------------------------------------------------- */

export async function fromPath(path: string): Promise<Rebate[]> {
  const file = await readFile(path, 'utf-8');
  const { data } = parse(file, { header: true, skipEmptyLines: true });
  return z.array(RebateSchema).parse(data);
}

export async function compareRebates(group: string, state: State) {
  const actual_files = await state.getSettings().listActualPaths(group);
  const actual = (await Promise.all(actual_files.map(fromPath))).flat();
  const expected_files = await state.getSettings().listExpectedPaths(group);
  const expected = (await Promise.all(expected_files.map(fromPath))).flat();

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

export function printResults(results: RunResults) {
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

export async function pushToXLSX(file: string, state: State) {
  const rebates = await state.getSettings().listActualGroups();

  const sheet = XLSX.utils.json_to_sheet(rebates);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Rebates");
  
  XLSX.writeFileXLSX(book, file);
}