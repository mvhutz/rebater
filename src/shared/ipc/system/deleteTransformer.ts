import { rm } from "fs/promises";
import { good } from "../../reply";

/** ------------------------------------------------------------------------- */

interface DeleteTransformerOptions {
  filepath: string;
}

export async function deleteTransformer(_: unknown, options: DeleteTransformerOptions) {
  await rm(options.filepath);

  return good(undefined);
}