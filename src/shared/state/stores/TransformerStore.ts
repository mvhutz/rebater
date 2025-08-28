import path from "path";
import { bad, good, Reply } from "../../reply";
import { FileStore } from "./FileStore";
import z from "zod/v4";
import { TransformerData, TransformerSchema } from "../../transformer";

/** ------------------------------------------------------------------------- */

interface TransformerMeta { name: string };

export class TransformerStore extends FileStore<TransformerData, TransformerMeta> {
  protected getFileFromItem(item: TransformerMeta): Reply<string> {
    return good(path.join(this.directory, item.name));
  }
  
  protected getItemFromFile(file_path: string): Reply<TransformerMeta> {
    const names = path.relative(this.directory, file_path).split(path.sep);
    return good({ name: names.join(path.sep) });
  }

  serialize(data: TransformerData): Reply<Buffer> {
    return good(Buffer.from(JSON.stringify(data, null, 2)));
  }
  
  deserialize(data: Buffer): Reply<TransformerData> { 
    let json: unknown;
    try {
      json = JSON.parse(data.toString());
    } catch (error) {
      return bad(`Thrown for transformer: ${error}`);
    }
    
    const parsed = TransformerSchema.safeParse(json);
    if (parsed.success) {
      return good(parsed.data);
    } else {
      return bad(z.prettifyError(parsed.error));
    }
  }
}