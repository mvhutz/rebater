import { good } from "../../reply";
import { shell } from "electron";

/** ------------------------------------------------------------------------- */

interface DeleteTransformerOptions {
  filepath: string;
}

export async function deleteTransformer(_: unknown, options: DeleteTransformerOptions) {
  await shell.trashItem(options.filepath);

  return good(undefined);
}