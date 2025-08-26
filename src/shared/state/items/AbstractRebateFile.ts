import { Rebate } from "../../../shared/worker/response";
import { AbstractFile } from "./AbstractFile";

/** ------------------------------------------------------------------------- */

/**
 * An Abstract file, which specifically contains Rebate data.
 */
export abstract class AbstractRebateFile extends AbstractFile<Rebate[]> {
  public constructor(path: string) {
    super(path);
  }

  insert(datum: Rebate[]): void {
    if (!this.data.ok) return;
    this.data.data.push(...datum);
  }
}