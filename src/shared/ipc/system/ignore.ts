import { bad, Reply } from "../../reply";

/** ------------------------------------------------------------------------- */

/**
 * If the user needs other information to parse the query, use this as a placeholder.
 * @param data The data you want passed through.
 * @returns A simple reply.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function ignore<I, O = undefined>(_: unknown, args: I): Promise<Reply<O>> {
  void [args];

  return bad("Not defined!");
}