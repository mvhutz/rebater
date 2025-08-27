import path from "path";
import { bad, good, Replier, Reply } from "../../reply";
import { Time, TimeSchema } from "../../time";
import { FileStore } from "./FileStore";
import z from "zod/v4";
import { Rebate, RebateSchema } from "../../worker/response";
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

interface RebateMeta { quarter: Time, name: string };

export class RebateStore extends FileStore<Rebate[], RebateMeta> {
  protected getFileFromItem(item: RebateMeta): Reply<string> {
    return good(path.join(this.directory, item.quarter.toString(), item.name));
  }
  
  protected getItemFromFile(file_path: string): Reply<RebateMeta> {
    const [dot, quarter, ...names] = path.relative(this.directory, file_path).split(path.sep);
    if (dot === "") {
      return bad("File not in directory!");
    }

    const time_schema = TimeSchema.safeParse(quarter);
    if (!time_schema.success) {
      return bad(`Could not parse time '${quarter}': ${z.prettifyError(time_schema.error)}`);
    }

    return good({ quarter: new Time(time_schema.data), name: names.join(path.sep) });
  }

  public serialize(data: Rebate[]): Reply<Buffer> {
    return Replier.of(good(data)).map(Papa.unparse).map(Buffer.from).end();
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