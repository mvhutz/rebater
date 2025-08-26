import { TransformerFile } from "../items/TransformerFile";
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
}