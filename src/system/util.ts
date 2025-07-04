import { z } from "zod/v4";
import fs from 'node:fs/promises';
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

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

export type Rebate = z.infer<typeof RebateSchema>;

export async function parseRebateFile(path: string): Promise<Rebate[]> {
  const file = await fs.readFile(path, 'utf-8');
  const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
  return z.array(RebateSchema).parse(data);
}