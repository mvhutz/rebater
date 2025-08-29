import { Rebate } from "../shared/worker/response";

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

export function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/\s/g, '');
}

export function isSlugEqual(a: string, b: string): boolean {
  return slugify(a) === slugify(b);
}