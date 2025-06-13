import FS from "fs/promises";
import { z } from "zod/v4";
import Papa from 'papaparse';

export async function fetchFile(path: string) {
  const file = await FS.readFile(path, 'utf-8');
  const { data } = Papa.parse(file, { header: true });
  return z.array(z.record(z.string(), z.string())).parse(data);

}

export async function compareRebates(file1: string, file2: string, options: { ignore?: string[] }) {
  const { ignore = [] } = options;
  const rebates1 = await fetchFile(file1);
  const rebates2 = await fetchFile(file2);

  const rows1 = rebates1.map(r => {
    const deleted: Record<string, string> = { ...r };
    for (const property of ignore) {
      delete deleted[property];
    }
    return Object.values(deleted).join();
  });

  const rows2 = rebates2.map(r => {
    const deleted: Record<string, string> = { ...r };
    for (const property of ignore) {
      delete deleted[property];
    }
    return Object.values(deleted).join();
  });

  for (const row of rows1) {
    if (!rows2.includes(row)) {
      console.log(`'${file2}' needs '${row}'`);
    }
  }

  for (const row of rows2) {
    if (!rows1.includes(row)) {
      console.log(`'${file1}' needs '${row}'`);
    }
  }
}
