import z from "zod/v4";
import { Rebate, RebateSchema } from "../../../shared/worker/response";
import { AbstractRebateFile } from "./AbstractRebateFile";
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

/**
 * An AbstractRebateFile, which stores in CSV format.
 */
export class CSVRebateFile extends AbstractRebateFile {
  serialize(): Buffer {
    return Buffer.from(Papa.unparse(this.data));
  }

  deserialize(raw: Buffer): Rebate[] {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    });

    return z.array(RebateSchema).parse(data);
  }
}