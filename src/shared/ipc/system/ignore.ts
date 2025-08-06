import { good, Reply } from "../../reply";

/** ------------------------------------------------------------------------- */

/**
 * If the user needs other information to parse the query, use this as a placeholder.
 * @param data The data you want passed through.
 * @returns A simple reply.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ignore<T>(_: unknown, args: T): Promise<Reply> {
  void [args];

  return good(undefined);
}