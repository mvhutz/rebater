import z from "zod/v4";
import { Rebate, RebateSchema } from "../../../shared/worker/response";
import { AbstractRebateFile } from "./AbstractRebateFile";
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

export class CSVRebateFile<Meta> extends AbstractRebateFile<Meta> {
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