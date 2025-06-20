import { glob, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "papaparse";
import XLSX from "xlsx";
import z from "zod/v4";

/** ------------------------------------------------------------------------- */

const RebateSchema = z.object({
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

export async function fromPath(path: string) {
  const file = await readFile(path, 'utf-8');
  const { data } = parse(file, { header: true, skipEmptyLines: true });
  return z.array(RebateSchema).parse(data);
}

export async function fromDir(dir: string, context: Context) {
  const folder = path.join(context.directory, dir, '**/*.csv');

  const results = new Array<Rebate>();
  for await (const filepath of glob(folder)) {
    results.push(...await fromPath(filepath));
  }

  return results;
}

export async function compareRebates(dir1: string, dir2: string, context: Context) {
  const rebates1 = await fromDir(dir1, context);
  const rebates2 = await fromDir(dir2, context);

  const rSet1 = new Set();
  for (const rebate of rebates1) {
    rebate.purchaseId = "X";

    const rebateAmount = Number(rebate.rebateAmount.replace(/[$,]/g, ""));
    rSet1.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount - 0.01).toFixed(2)}` }).join());
    rSet1.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.00).toFixed(2)}` }).join());
    rSet1.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.01).toFixed(2)}` }).join());
  }

  const rSet2 = new Set();
  for (const rebate of rebates2) {
    rebate.purchaseId = "X";

    const rebateAmount = Number(rebate.rebateAmount.replace(/[$,]/g, ""));
    rSet2.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount - 0.01).toFixed(2)}` }).join());
    rSet2.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.00).toFixed(2)}` }).join());
    rSet2.add(Object.values({ ...rebate, rebateAmount: `$${(rebateAmount + 0.01).toFixed(2)}` }).join());
  }

  const rebateStrs1 = rebates1.map(r => Object.values(r).join());
  const rebateStrs2 = rebates2.map(r => Object.values(r).join());

  return { 
    file1: rebateStrs1.filter(r1 => !rSet2.has(r1)),
    file2: rebateStrs2.filter(r2 => !rSet1.has(r2)),
  }
}

export async function availableAnswers(context: Context) {
  const total = path.join(context.directory, 'rebates');
  const dir = await readdir(total);
  return dir;
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

export async function pushToXLSX(file: string, context: Context) {
  const rebates = await fromDir("rebates", context);

  const sheet = XLSX.utils.json_to_sheet(rebates);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Rebates");
  
  XLSX.writeFileXLSX(book, file);
}