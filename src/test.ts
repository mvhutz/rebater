import { glob, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "papaparse";
import z from "zod/v4";

export async function fromPath(path: string, ignore: string[] = []) {
  const file = await readFile(path, 'utf-8');
  const { data } = parse(file, { header: true });
  const parsed = z.array(z.record(z.string(), z.string())).parse(data);

  const rows = parsed.map(r => {
    const deleted: Record<string, string> = { ...r };
    for (const property of ignore) {
      delete deleted[property];
    }
    return Object.values(deleted).join();
  });

  return rows.filter(r => r.length > 0);
}

export async function fromDir(dir: string, ignore: string[] = [], context: Context) {
  const folder = path.join(context.directory, dir, '**/*.csv');

  const results = new Array<string>();
  for await (const filepath of glob(folder)) {
    results.push(...await fromPath(filepath, ignore));
  }

  return results;
}

export async function compareRebates(dir1: string, dir2: string, options: { ignore?: string[], context: Context }) {
  const rebates1 = await fromDir(dir1, options.ignore, options.context);
  const rebates2 = await fromDir(dir2, options.ignore, options.context);

  return { 
    file1: rebates1.filter(r => !rebates2.includes(r)),
    file2: rebates2.filter(r => !rebates1.includes(r)),
  }
}

export async function availableAnswers(context: Context) {
  const total = path.join(context.directory, 'rebates');
  const dir = await readdir(total);
  return dir;
}

export function printResults(results: RunResults) {
  console.log('\n==== [PERFORMANCE] ====\n')
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