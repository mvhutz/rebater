import { Rebate } from "../../../shared/worker/response";
import { AbstractFile } from "./AbstractFile";

/** ------------------------------------------------------------------------- */

/**
 * An Abstract file, which specifically contains Rebate data.
 */
export abstract class AbstractRebateFile<Meta> extends AbstractFile<Rebate[], Meta> {
  public constructor(path: string, meta: Meta) {
    super(path, [], meta);
  }

  insert(datum: Rebate[]): void {
    this.data.push(...datum);
  }
}