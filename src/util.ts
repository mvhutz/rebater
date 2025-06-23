import z from "zod/v4";

export const ExcelIndexSchema = z.union([z.number(), z.string().regex(/[A-Z]+/)]);
export type ExcelIndex = z.infer<typeof ExcelIndexSchema>;

function getIndexFromExcel(letters: string): number {
  let result = 0;

  for (let p = 0; p < letters.length; p++) {
      result = letters.charCodeAt(p) - 64 + result * 26;
  }

  return result - 1;
}

export function getTrueIndex(index: ExcelIndex): number {
  if (typeof index === "number") return index;
  return getIndexFromExcel(index);
}