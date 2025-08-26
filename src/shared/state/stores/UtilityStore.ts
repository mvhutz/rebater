import path from "path";
import { ReferenceFile } from "../items/ReferenceFile";
import { Time } from "../../../shared/time";
import { FileStore } from "./FileStore";

/** ------------------------------------------------------------------------- */

interface Meta { quarter: Time };

export class UtilityFile extends ReferenceFile {
  public meta: Meta;

  constructor(path: string, name: string, meta: Meta) {
    super(path, name);

    this.meta = meta;
  }
}

/** ------------------------------------------------------------------------- */

/**
 * Holds all utilities created and used by the Transformers.
 */
export class UtilityStore extends FileStore<UtilityFile> {
  public readonly name = "utilities";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await FileStore.getSubFolders(this.directory)) {
      const quarter = Time.parse(time_str);
      if (quarter == null) continue;

      for (const [filepath, name] of await FileStore.getSubFiles(time_path)) {
        const reference = new UtilityFile(filepath, path.parse(name).name, { quarter });
        this.add(reference);
      }
    }
  }
}