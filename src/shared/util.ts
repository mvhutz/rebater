import z from "zod/v4";

/**
 * A schema that automatically converts any numbers, strings as numbers, or
 * Excel indices (A, B, ...) to 0-based indices.
 */
export const ExcelIndexSchema: z.ZodType<number> = z.union([
  z.number(),
  z.string().regex(/[A-Z]+/)
]).transform(s => getTrueIndex(s));

/**
 * Convert an Excel index into a 0-based index.
 * @param letters The index to parse. Must be valid.
 * @returns The 0-based index.
 */
export function getIndexFromExcel(letters: string): number {
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