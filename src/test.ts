import FS from "fs/promises";
import { z } from "zod/v4";
import Papa from 'papaparse';
import MAGIC from "./magic";
import Path from "path";

export async function fromPath(path: string, ignore: string[] = []) {
  const file = await FS.readFile(path, 'utf-8');
  const { data } = Papa.parse(file, { header: true });
  const parsed = z.array(z.record(z.string(), z.string())).parse(data);

  const rows = parsed.map(r => {
    const deleted: Record<string, string> = { ...r };
    for (const property of ignore) {
      delete deleted[property];
    }
    return Object.values(deleted).join();
  });

  return rows
}

export async function fromDir(dir: string, ignore: string[] = []) {
  const path = Path.join(MAGIC.DIRECTORY, dir, '**/*.csv');

  const results = new Array<string>();
  for await (const filepath of FS.glob(path)) {
    results.push(...await fromPath(filepath, ignore));
  }

  return results;
}

export async function compareRebates(dir1: string, dir2: string, options: { ignore?: string[] }) {
  const rebates1 = await fromDir(dir1, options.ignore);
  const rebates2 = await fromDir(dir2, options.ignore);

  return { 
    file1: rebates1.filter(r => !rebates2.includes(r)),
    file2: rebates2.filter(r => !rebates1.includes(r)),
  }
}

export async function availableAnswers() {
  const total = Path.join(MAGIC.DIRECTORY, 'rebates');
  const dir = await FS.readdir(total)
  return dir;
}
