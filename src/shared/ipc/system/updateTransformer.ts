import { writeFile } from "fs/promises";
import { good } from "../../reply";

/** ------------------------------------------------------------------------- */

interface UpdateTransformerOptions {
  /** The configuration itself, in JSON. */
  configuration: string;

  filepath: string;
}

export async function updateTransformer(_: unknown, options: UpdateTransformerOptions) {
  await writeFile(options.filepath, options.configuration);
  return good(undefined);
}