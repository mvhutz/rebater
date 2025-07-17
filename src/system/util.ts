import { z } from "zod/v4";
import fs from 'fs/promises';
import Papa from 'papaparse';
import assert from "assert";

/** ------------------------------------------------------------------------- */

function getIndexFromExcel(letters: string): number {
  return letters.split("").reduce((s, c) => c.charCodeAt(0) - 64 + s * 26, 0) - 1;
}

export const ExcelIndexSchema = z
  .union([z.coerce.number().int(), z.string().regex(/[A-Z]+/)])
  .transform(v => {
    if (typeof v === "number") return v;
    return getIndexFromExcel(v);
  });

/** ------------------------------------------------------------------------- */

const RebateSchema = z.strictObject({
  purchaseId: z.coerce.string(),
  transactionDate: z.coerce.string(),
  supplierId: z.coerce.string(),
  memberId: z.coerce.string(),
  distributorName: z.coerce.string(),
  purchaseAmount: z.coerce.number(),
  rebateAmount: z.coerce.number(),
  invoiceId: z.coerce.string(),
  invoiceDate: z.coerce.string(),
});

export type Rebate = z.infer<typeof RebateSchema>;

export function getRebateHash(rebate: Rebate): string {
  const { transactionDate, supplierId, memberId, distributorName, purchaseAmount, rebateAmount, invoiceId, invoiceDate } = rebate;
  return `${transactionDate},${supplierId},${memberId},${distributorName},${purchaseAmount},${rebateAmount},${invoiceId},${invoiceDate}`;
}

export function areRebatesEqual(a: Rebate, b: Rebate) {
  return a.invoiceId === b.invoiceId
    && Math.abs(a.purchaseAmount - b.purchaseAmount) <= 0.02
    && Math.abs(a.rebateAmount - b.rebateAmount) <= 0.02
    && a.invoiceDate === b.invoiceDate
    && a.transactionDate === b.transactionDate
    && a.supplierId === b.supplierId
    && a.memberId === b.memberId
    && a.distributorName === b.distributorName;
}

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

export class RebateSet {
  private buckets: Record<string, Rebate[]>;

  constructor(rebates: Rebate[]) {
    this.buckets = {};

    for (const rebate of rebates) {
      this.give(rebate);
    }
  }

  public values() {
    return Object.values(this.buckets).flat();
  }

  public find(rebate: Rebate): Maybe<[string, number]> {
    const bucket = this.buckets[rebate.invoiceId];
    if (bucket == null) return null;

    for (let i = 0; i < bucket.length; i++) {
      if (areRebatesEqual(bucket[i], rebate)) {
        return [rebate.invoiceId, i];
      }
    }

    return null;
  }

  public has(rebate: Rebate) {
    return this.find(rebate) != null;
  }

  public give(rebate: Rebate) {
    (this.buckets[rebate.invoiceId] ??= []).push(rebate);
  }

  public take(rebate: Rebate) {
    const place = this.find(rebate);
    if (place == null) return false;

    this.buckets[place[0]].splice(place[1], 1);
    return true;
  }
}

export function rewire(table: Table) {
  table.data.forEach(r => { r.table = table; });
  return table;
}

export function makeTable(rows: string[][], path = "") {
  const table: Table = { data: [], path };
  table.data = rows.map(r => ({ data: r, table }));

  return table;
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