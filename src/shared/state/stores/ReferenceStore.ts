import path from "path";
import { ReferenceFile } from "../items/ReferenceFile";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

/**
 * Holds all references used by the Transformers.
 */
export class ReferenceStore extends FileStore<ReferenceFile> {
  public readonly name = "references";

  public async gather(): Promise<void> {
    this.wipe();
    
    for (const [filepath, name] of await FileStore.getSubFiles(this.directory)) {
      const reference = new ReferenceFile(filepath, path.parse(name).name);
      this.add(reference);
    }
  }

  generate(hash: string): ReferenceFile {
    return new ReferenceFile(path.join(this.directory, `${hash}.csv`), hash);
  }
}