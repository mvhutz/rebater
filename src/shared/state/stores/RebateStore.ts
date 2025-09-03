import path from "path";
import { bad, good, Replier, Reply } from "../../reply";
import { Time } from "../../time";
import { FileStore } from "./FileStore";
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../worker/response";
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

interface RebateMeta { quarter: Time, name: string };

export class RebateStore extends FileStore<Rebate[], RebateMeta> {
  public getFileFromItem(item: RebateMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.name));
  }
  
  public getItemFromFile(file_path: string): Reply<RebateMeta> {
    const [quarter, ...names] = path.relative(this.directory, file_path).split(path.sep);
    
    return Replier.of(Time.parse(quarter))
      .map(t => ({ quarter: t, name: names.join(path.sep) }))
      .end();
  }

  public serialize(data: Rebate[]): Reply<Buffer> {
    return Replier.of(good(data)).map(Papa.unparse).map(f => Buffer.from(f)).end();
  }
  
  public deserialize(raw: Buffer): Reply<Rebate[]> {
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