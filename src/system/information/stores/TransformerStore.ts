import path from "path";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles } from "../../util";
import { TransformerFile } from "../items/TransformerFile";
import { TransformerData } from "../../../shared/transformer";

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

/**
 * Holds all transformers.
 */
export class TransformerStore extends AbstractStore<TransformerFile, Meta> {
  public readonly name = "transformers";

  public async gather(): Promise<void> {
    for (const [filepath, name] of await getSubFiles(this.meta.directory)) {
      let type: "json" | "xml";
      if (path.parse(name).ext === ".json") {
        type = "json";
      } else if (path.parse(name).ext === ".xml") {
        type = "xml"
      } else {
        continue;
      }

      const reference = new TransformerFile(filepath, { type });
      this.add(reference);
    }
  }

  /**
   * Get all valid transformers.
   * @returns All transformers from files in the store, which are valid.
   */
  public getValid(): TransformerData[] {
    const transformer_replies = this.items.values().map(f => f.getData());
    const good = transformer_replies.filter(r => r.ok);
    return good.map(g => g.data).toArray();
  }
}