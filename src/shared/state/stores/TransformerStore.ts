import { TransformerFile } from "../items/TransformerFile";
import { TransformerData } from "../../../shared/transformer";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

/**
 * Holds all transformers.
 */
export class TransformerStore extends FileStore<TransformerFile> {
  public readonly name = "transformers";

  public async gather(): Promise<void> {
    for (const [filepath] of await FileStore.getSubFiles(this.directory)) {
      const reference = new TransformerFile(filepath);
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