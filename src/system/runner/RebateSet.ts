import moment from "moment";
import { Rebate } from "../../shared/worker/response";

/** ------------------------------------------------------------------------- */

// Common output date formats.
const COMMON_PARSE = ["MM/DD/YY", "M/D/YYYY"];

/**
 * A rebate multi-set. Optimized to search for rebates by invoiceID.
 * 
 * Sifting through a set of 50,000 rebates for discrepancies is very time
 * consuming. This class makes the process faster.
 */
export class RebateSet {
  /** Rebates, sorted by invoice. */
  private buckets: Record<string, Rebate[]>;

  constructor(rebates: Rebate[]) {
    this.buckets = {};

    for (const rebate of rebates) {
      this.give(rebate);
    }
  }

  /**
   * Get all rebates in the set.
   * @returns A list of all rebates.
   */
  public values() {
    return Object.values(this.buckets).flat();
  }

  /**
   * Find the invoice and index of a rebate in the set.
   * @param rebate The rebate to search for.
   * @returns If found, a list containing (1) the bucket it is in, and (2) its index in that bucket.
   */
  public find(rebate: Rebate): Maybe<[string, number]> {
    const bucket = this.buckets[rebate.invoiceId];
    if (bucket == null) return null;

    for (let i = 0; i < bucket.length; i++) {
      if (RebateSet.areRebatesEqual(bucket[i], rebate)) {
        return [rebate.invoiceId, i];
      }
    }

    return null;
  }

  /**
   * Does the set have a specific rebate?
   * @param rebate The search to search for.
   * @returns True if the rebate exists.
   */
  public has(rebate: Rebate) {
    return this.find(rebate) != null;
  }

  /**
   * Add a rebate to the set.
   * @param rebate The rebate to add.
   */
  public give(rebate: Rebate) {
    (this.buckets[rebate.invoiceId] ??= []).push(rebate);
  }

  /**
   * Remove a rebate from the set.
   * @param rebate The rebate to remove.
   * @returns True, if a rebate has actually removed.
   */
  public take(rebate: Rebate) {
    const place = this.find(rebate);
    if (place == null) return false;

    this.buckets[place[0]].splice(place[1], 1);
    return true;
  }

  /**
   * Determine if two rebates are "basically" equal.
   * @param a One rebate.
   * @param b Another rebate.
   * @returns True, if the rebates are reasonably equal.
   */
  public static areRebatesEqual(a: Rebate, b: Rebate) {
    return a.invoiceId === b.invoiceId
      && Math.abs(a.purchaseAmount - b.purchaseAmount) <= 0.02
      && Math.abs(a.rebateAmount - b.rebateAmount) <= 0.02
      && moment(a.invoiceDate, COMMON_PARSE).format("MM/DD/YY") === moment(b.invoiceDate, COMMON_PARSE).format("MM/DD/YY")
      && moment(a.transactionDate, COMMON_PARSE).format("MM/DD/YY") === moment(b.transactionDate, COMMON_PARSE).format("MM/DD/YY")
      && a.supplierId === b.supplierId
      && a.memberId === b.memberId
      // && a.distributorName === b.distributorName;
  }
}