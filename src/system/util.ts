import { z } from "zod/v4";
import fs from 'fs/promises';
import Papa from 'papaparse';
import assert from "assert";

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
  purchaseId: z.coerce.string(),
  transactionDate: z.coerce.string(),
  supplierId: z.coerce.string(),
  memberId: z.coerce.string(),
  distributorName: z.coerce.string(),
  purchaseAmount: z.coerce.string(),
  rebateAmount: z.coerce.string(),
  invoiceId: z.coerce.string(),
  invoiceDate: z.coerce.string(),
});

export type Rebate = z.infer<typeof RebateSchema>;

export async function parseRebateFile(path: string): Promise<Rebate[]> {
  try {
    const file = await fs.readFile(path, 'utf-8');
    const { data } = Papa.parse(file, { header: true, skipEmptyLines: true });
    return z.array(RebateSchema).parse(data);
  } catch (error) {
    assert.ok(error instanceof z.ZodError);
    throw new Error(`Error processing '${path}': ${z.prettifyError(error)}`)
  }
}

export function getRebateHash(rebate: Rebate): string {
  const { transactionDate, supplierId, memberId, distributorName, purchaseAmount, rebateAmount, invoiceId, invoiceDate } = rebate;
  return `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${rebateAmount},${invoiceId},${invoiceDate}`;
}

export function getRebateHashFuzzy(rebate: Rebate): string[] {
  const { transactionDate, supplierId, memberId, distributorName, purchaseAmount, rebateAmount, invoiceId, invoiceDate } = rebate;
  const underRebateAmount = (Number(rebateAmount) - 0.01).toFixed(2);
  const overRebateAmount = (Number(rebateAmount) + 0.01).toFixed(2);
  return [
    `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${underRebateAmount},${invoiceId},${invoiceDate}`,
    `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${rebateAmount},${invoiceId},${invoiceDate}`,
    `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${overRebateAmount},${invoiceId},${invoiceDate}`
  ];
}

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

/** ------------------------------------------------------------------------- */

// function getUnitCubicCurve(x: number, angle: number) {
//   return (angle - 2) * (x ** 3) + (-2 * angle + 3) * (x ** 2) + angle * x;
// }

// function getCubicCurve(x: number, angle: number, start: [number, number], end: [number, number]) {
//   const [a, b] = start;
//   const [c, d] = end;

//   return (d - b) * getUnitCubicCurve((x - a) / (c - a), angle * (c - a) / (d - b)) + b
// }

// export function useFancyAnimation(value: number, delay: number, handler: (value: number) => void) {
//   const previous = usePrevious(value);

//   React.useEffect(() => {
//     let timer = delay;
//     const token = setInterval(() => {
//       if (timer < delay) return clearInterval(token);
//       timer -= 100;
      
//     }, 100);
//   }, [value, delay]);
// }