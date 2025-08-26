import path from "path";
import { bad, good, Reply } from "../../../shared/reply";
import { AbstractFile } from "./AbstractFile";
import z from "zod/v4";
import { TransformerData, TransformerSchema } from "../../../shared/transformer";

/** ------------------------------------------------------------------------- */

interface Meta { type: "json" | "xml" };

/**
 * An AbstractFile which holds source data.
 */
export class TransformerFile extends AbstractFile<Reply<TransformerData>, Meta> {
  constructor(path: string, meta: Meta) {
    super(path, bad("Not loaded!"), meta);
  }

  serialize(): Buffer {
    if (!this.data.ok) {
      throw new Error("Not loaded!");
    } else {
      return Buffer.from(JSON.stringify(this.data.data, null, 2));
    }
  }

  deserialize(data: Buffer): Reply<TransformerData> {    
    try {
      const json = JSON.parse(data.toString());
      return good(TransformerSchema.parse(json));
    } catch (error) {
      const name = path.basename(this.path);

      if (error instanceof z.ZodError) {
        return bad(`Invalid schema for ${this.path}: ${z.prettifyError(error)}`, name);
      } else if (error instanceof Error) {
        return bad(`Invalid schema for ${this.path}: ${error.message}`, name);
      } else {
        return bad(`Thrown for ${this.path}: ${error}`, name);
      }
    }
  }

  insert(): void {
    throw new Error("Cannot add to transformers!");
  }
}