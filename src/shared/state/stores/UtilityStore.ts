import path from "path";
import { AbstractStore } from "./AbstractStore";
import { getSubFiles, getSubFolders } from "./util";
import { ReferenceFile } from "../items/ReferenceFile";
import { Time } from "../../../shared/time";

/** ------------------------------------------------------------------------- */

interface Meta { directory: string };

/**
 * Holds all utilities created and used by the Transformers.
 */
export class UtilityStore extends AbstractStore<ReferenceFile<{ quarter: Time }>, Meta> {
  public readonly name = "utilities";

  public async gather(): Promise<void> {
    for (const [time_path, time_str] of await getSubFolders(this.meta.directory)) {
      const quarter = Time.parse(time_str);
      if (quarter == null) continue;

      for (const [filepath, name] of await getSubFiles(time_path)) {
        const reference = new ReferenceFile(filepath, path.parse(name).name, { quarter });
        this.add(reference);
      }
    }
  }
}