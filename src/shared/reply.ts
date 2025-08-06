interface BadReply {
  ok: false;

  /** An explanation for the error. */
  reason: string;

  /** Optional subtext. */
  message?: string;
}

/**
 * Build a bad reply.
 * @param reason The reason to give.
 * @param message The message to send.
 * @returns A complete `BadReply` object.
 */
export function bad(reason: string, message?: string): BadReply {
  return { ok: false, reason, message };
}

interface GoodReply<T> {
  ok: true;

  /** The resulting object. */
  data: T;
  
  /** Optional subtext. */
  message?: string;
}

/**
 * Build a good reply.
 * @param data The data to give.
 * @param message The message to send.
 * @returns A complete `GoodReply` object.
 */
export function good<T>(data: T, message?: string): GoodReply<T> {
  return { ok: true, data: data, message };
}

/** A error-catching return value. */
export type Reply<T = undefined> = BadReply | GoodReply<T>;
