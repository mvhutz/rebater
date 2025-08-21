import { writeFile } from "fs/promises";
import { good } from "../../reply";

/** ------------------------------------------------------------------------- */

interface CreateTransformerOptions {
  /** The configuration itself, in JSON. */
  configuration: string;

  filepath: string;
}

export async function createTransformer(_: unknown, options: CreateTransformerOptions) {
  await writeFile(options.filepath, options.configuration);
  return good(undefined);
}