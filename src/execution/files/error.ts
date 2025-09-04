import { Result } from "ts-results";

/** ------------------------------------------------------------------------- */

export type RebaterErrorType =
  | { type: "FILE_COLLECTION"; subtype: "FILE_NOT_FOUND" }
  | { type: "FILE_COLLECTION"; subtype: "FILE_ALREADY_EXISTS" }
  | { type: "FILE_STORE", subtype: "READ_DIRECTORY" }
  | { type: "FILE_STORE", subtype: "READ_FILE" }
  | { type: "FILE_STORE", subtype: "SAVE_FILE" }
  | { type: "FILE_STORE", subtype: "LOCK_FILE" }

export type RebaterError = RebaterErrorType & { message: string, cause?: unknown };

export type RebaterResult<T = void> = Result<T, RebaterErrorType>;

/**
 * A helper function to create a rebater error.
 * @param type The type of error.
 * @param subtype The sub-type of error.
 * @param message A human-readable message for the error.
 * @param cause Optionally, specify a throw-able that caused the error.
 * @returns A completed `RebateError` object.
 */
export function Thrown<X extends RebaterErrorType>(type: X["type"], subtype: X["subtype"], message: string, cause?: unknown): RebaterError {
  return { type, subtype, message, cause } as RebaterErrorType & RebaterError;
}

/** ------------------------------------------------------------------------- */

export type RebaterDebug =
  | { type: "FILE_STORE", subtype: "FILE_UPDATED", name: string }
  | { type: "FILE_STORE", subtype: "FILE_ADDED", name: string }
  | { type: "FILE_STORE", subtype: "FILE_DELETED", name: string }