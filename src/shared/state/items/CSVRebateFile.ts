import z from "zod/v4";
import { Rebate, RebateSchema } from "../../../shared/worker/response";
import { AbstractRebateFile } from "./AbstractRebateFile";
import Papa from 'papaparse';
import { bad, good, Reply } from "../../reply";

/** ------------------------------------------------------------------------- */

/**
 * An AbstractRebateFile, which stores in CSV format.
 */
export class CSVRebateFile extends AbstractRebateFile {
  serialize(data: Rebate[]): Buffer {
    return Buffer.from(Papa.unparse(data));
  }

  deserialize(raw: Buffer): Reply<Rebate[]> {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
    });

    const parsed = z.array(RebateSchema).safeParse(data);
    if (parsed.success) {
      return good(parsed.data);
    } else {
      return bad(z.prettifyError(parsed.error));
    }
  }
}