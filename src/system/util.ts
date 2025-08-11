import { z } from "zod/v4";
import { readdir } from 'fs/promises';
import path from "path";
import { Rebate } from "../shared/worker/response";

/** ------------------------------------------------------------------------- */

/**
 * A schema that automatically converts any numbers, strings as numbers, or
 * Excel indices (A, B, ...) to 0-based indices.
 */
export const ExcelIndexSchema = z.union([
  z.number(),
  z.string().regex(/[A-Z]+/)
]).transform(s => getTrueIndex(s));

/**
 * Convert an Excel index into a 0-based index.
 * @param letters The index to parse. Must be valid.
 * @returns The 0-based index.
 */
function getIndexFromExcel(letters: string): number {
  return letters.split("").reduce((s, c) => c.charCodeAt(0) - 64 + s * 26, 0) - 1;
}

/**
 * Turn a number into an Excel index.
 * @param n The number.
 * @returns An Excel index.
 */
export function getExcelFromIndex(n: number) {
  n++;
  let res = "";

  while (n > 0) {
    const rem = n % 26;

    if (rem === 0) {
      res += 'Z';
      n = Math.floor(n / 26) - 1;
    } else {
      res += String.fromCharCode((rem - 1) + 'A'.charCodeAt(0));
      n = Math.floor(n / 26);
    }
  }

  return res.split("").reverse().join("");
}

/**
 * Attempts to index-like a value into a number.
 * @param index An index-like value. Could be an Excel index, or just a normal number.
 * @returns A number.
 */
export function getTrueIndex(index: string | number): number {
  if (typeof index === "number") return index;
  return getIndexFromExcel(index);
}

/** ------------------------------------------------------------------------- */

/**
 * Create hash unique hash for a rebate.
 * @param rebate The rebate.
 * @returns The unique hash.
 */
export function getRebateHash(rebate: Rebate): string {
  const { transactionDate, supplierId, memberId, distributorName, purchaseAmount, rebateAmount, invoiceId, invoiceDate } = rebate;
  return `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${rebateAmount},${invoiceId},${invoiceDate}`;
}

/**
 * Partition a set of objects into seperate buckets, based upon the value of a certain property.
 * @param objects The set of objects.
 * @param key The proerty to split on.
 * @returns A list of buckets, where each bucket contains a set of objects where their `key` is equal.
 */
export function getPartition<O extends object, K extends keyof O>(objects: O[], key: K): Map<O[K], O[]> {
  const buckets = new Map<O[K], O[]>();
  for (const object of objects) {
    const bucket = buckets.get(object[key]);
    if (bucket == null) {
      buckets.set(object[key], [object]);
    } else {
      bucket.push(object);
    }
  }

  return buckets;
}

/**
 * Given a directory, find all files in the directory. This is recursive.
 * @param directory The directory to search.
 * @returns All files found. Each file is a list containing (1) its absolute path, and (2) its name.
 */
export async function getSubFiles(directory: string): Promise<[string, string][]> {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  return entries.filter(e => e.isFile()).map(e => [path.join(e.parentPath, e.name), e.name]);
}

/**
 * Given a directory, find all folders in the directory. This is not recursive.
 * @param directory The directory to search.
 * @returns All folders found. Each folder is a list containing (1) its absolute path, and (2) its name.
 */
export async function getSubFolders(directory: string): Promise<[string, string][]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => [path.join(e.parentPath, e.name), e.name]);
}
