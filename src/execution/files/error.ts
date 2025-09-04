import { Result } from "ts-results";

/** ------------------------------------------------------------------------- */

export type RebaterError =
  | ["FILE_COLLECTION", "FILE_NOT_FOUND", { collection: string, file: string }]
  | ["FILE_COLLECTION", "FILE_ALREADY_EXISTS", { collection: string, file: string }]
  | ["FILE_STORE", "READ_DIRECTORY", { store: string, directory: string, cause: unknown }]
  | ["FILE_STORE", "READ_FILE", { store: string, file: string, cause: unknown }]
  | ["FILE_STORE", "SAVE_FILE", { store: string, file: string, cause: unknown }]
  | ["FILE_STORE", "REMOVE_FILE", { store: string, file: string, cause: unknown }]
  | ["LOCKER", "OBTAIN_LOCK", { file: string, cause: unknown }]
  | ["LOCKER", "RELEASE_LOCK", { file: string, cause: unknown }]

export type RebaterResult<T = void> = Result<T, RebaterError>;

/**
 * Type-safe way to define Rebater errors.
 * @param args Rebate error arguments.
 * @returns The error.
 */
export function Thrown(...args: RebaterError): RebaterError {
  return args;
}

/** ------------------------------------------------------------------------- */
