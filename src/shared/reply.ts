export interface BadReply {
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

export interface GoodReply<T> {
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

export class Replier<T> {
  public readonly reply: Reply<T>;

  private constructor(reply: Reply<T>) {
    this.reply = reply;
  }

  public static of<T>(reply: Reply<T>) {
    return new Replier(reply);
  }

  bind<O>(fn: (datum: T) => Reply<O>): Replier<O> {
    if (this.reply.ok) {
      return new Replier(fn(this.reply.data));
    } else {
      return new Replier(this.reply);
    }
  }

  map<O>(fn: (datum: T) => O): Replier<O> {
    if (this.reply.ok) {
      return new Replier(good(fn(this.reply.data)));
    } else {
      return new Replier(this.reply);
    }
  }

  async bindAsync<O>(fn: (datum: T) => Promise<Reply<O>>): Promise<Replier<O>> {
    if (this.reply.ok) {
      return new Replier(await fn(this.reply.data));
    } else {
      return new Replier(this.reply);
    }
  }

  end(): Reply<T> {
    return this.reply;
  }
}

export interface Resource<T> {
  loading: boolean;
  response: Reply<T>;
}

export function loading<T>(reply: Reply<T>): Resource<T> {
  return { loading: true, response: reply };
}

export function present<T>(reply: Reply<T>): Resource<T> {
  return { loading: false, response: reply };
}

export function unloaded<T>(): Resource<T> {
  return { loading: false, response: bad("Not loaded!") };
}