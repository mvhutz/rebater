import path from "path";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles } from "./util";
import { ReferenceFile } from "../items/ReferenceFile";

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

/**
 * Holds all references used by the Transformers.
 */
export class ReferenceStore extends AbstractStore<ReferenceFile, Meta> {
  public readonly name = "references";

  public async gather(): Promise<void> {
    this.wipe();
    
    for (const [filepath, name] of await getSubFiles(this.meta.directory)) {
      const reference = new ReferenceFile(filepath, path.parse(name).name, {});
      this.add(reference);
    }
  }

  generate(hash: string): ReferenceFile {
    return new ReferenceFile(path.join(this.meta.directory, `${hash}.csv`), hash, {});
  }
}