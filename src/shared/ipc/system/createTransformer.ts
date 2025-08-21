import { writeFile } from "fs/promises";
import { good } from "../../reply";

/** ------------------------------------------------------------------------- */

interface CreateTransformerOptions {
  /** The configuration itself, in JSON. */
  configuration: unknown;

  filepath: string;
}

export async function createTransformer(_: unknown, options: CreateTransformerOptions) {
  await writeFile(options.filepath, JSON.stringify(options.configuration));
  return good(undefined);
}