import { readdir } from "fs/promises";
import { AbstractStore } from "./AbstractStore";
import path from "path";
import { AbstractFile } from "../items/AbstractFile";

/** ------------------------------------------------------------------------- */

export abstract class FileStore<Item extends AbstractFile<Parameters<Item["insert"]>["0"]>> extends AbstractStore<Item, Parameters<Item["insert"]>["0"]> {
  public directory: string;
  constructor(directory: string) {
    super();

    this.directory = directory;
  }

  /**
 * Given a directory, find all files in the directory. This is recursive.
 * @param directory The directory to search.
 * @returns All files found. Each file is a list containing (1) its absolute path, and (2) its name.
 */
  static async getSubFiles(directory: string): Promise<[string, string][]> {
    const entries = await readdir(directory, { withFileTypes: true, recursive: true });
    return entries.filter(e => e.isFile()).map(e => [path.join(e.parentPath, e.name), e.name]);
  }

  /**
   * Given a directory, find all folders in the directory. This is not recursive.
   * @param directory The directory to search.
   * @returns All folders found. Each folder is a list containing (1) its absolute path, and (2) its name.
   */
  static async getSubFolders(directory: string): Promise<[string, string][]> {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => [path.join(e.parentPath, e.name), e.name]);
  }

  /**
   * Get all valid transformers.
   * @returns All transformers from files in the store, which are valid.
   */
  public getValid(fn?: (item: Item) => boolean): Parameters<Item["insert"]>["0"][] {
    const transformer_replies = this.filter(fn).map(f => f.getData());
    const good = transformer_replies.filter(r => r.ok);
    return good.map(g => g.data);
  }
}