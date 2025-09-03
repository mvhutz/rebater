import path from "path";
import { bad, good, Replier, Reply } from "../../reply";
import { FileStore } from "./FileStore";
import z from "zod/v4";
import Papa from 'papaparse';

/** ------------------------------------------------------------------------- */

interface MatrixMeta { group: string, name: string };

export class MatrixStore extends FileStore<string[][], MatrixMeta> {
  public getFileFromItem(item: MatrixMeta): Reply<string> {
    return good(path.join(this.directory, item.group, item.name));
  }
  
  public getItemFromFile(file_path: string): Reply<MatrixMeta> {
    const [group, ...names] = path.relative(this.directory, file_path).split(path.sep);
    
    return good({ group, name: names.join(path.sep) });
  }

  public serialize(data: string[][]): Reply<Buffer> {
    return Replier.of(good(data)).map(Papa.unparse).map(f => Buffer.from(f)).end();
  }
  
  public deserialize(raw: Buffer): Reply<string[][]> {
    const { data } = Papa.parse(raw.toString("utf-8"), {
      header: false,
      skipEmptyLines: true,
    });

    const parsed = z.array(z.array(z.string())).safeParse(data);
    if (parsed.success) {
      return good(parsed.data);
    } else {
      return bad(z.prettifyError(parsed.error));
    }
  }
}